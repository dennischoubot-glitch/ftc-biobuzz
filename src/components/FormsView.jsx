import { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical, Copy } from 'lucide-react';
import { generateId } from '../utils/storage';

const QUESTION_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Multiple Choice' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'rating', label: 'Rating (1-5)' },
];

export default function FormsView({ data, update }) {
  const [editingForm, setEditingForm] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [questions, setQuestions] = useState([]);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [newQ, setNewQ] = useState({ label: '', type: 'number', options: '', required: false, max: 5 });

  function startEdit(form) {
    setEditingForm(form);
    setFormName(form.name);
    setFormDesc(form.description || '');
    setQuestions([...form.questions]);
  }

  function startNew() {
    setEditingForm({ id: null });
    setFormName('');
    setFormDesc('');
    setQuestions([]);
  }

  function saveForm() {
    if (!formName.trim()) return;
    const formData = {
      id: editingForm.id || generateId(),
      name: formName,
      description: formDesc,
      questions,
    };
    update(d => ({
      ...d,
      forms: editingForm.id
        ? d.forms.map(f => f.id === editingForm.id ? formData : f)
        : [...d.forms, formData],
    }));
    setEditingForm(null);
  }

  function deleteForm(id) {
    if (!confirm('Delete this form and all its scouting data?')) return;
    update(d => ({
      ...d,
      forms: d.forms.filter(f => f.id !== id),
      scoutingEntries: d.scoutingEntries.filter(e => e.formId !== id),
    }));
  }

  function duplicateForm(form) {
    const copy = {
      ...form,
      id: generateId(),
      name: `${form.name} (Copy)`,
      questions: form.questions.map(q => ({ ...q, id: generateId() })),
    };
    update(d => ({ ...d, forms: [...d.forms, copy] }));
  }

  function addQuestion() {
    if (!newQ.label.trim()) return;
    const q = {
      id: generateId(),
      label: newQ.label,
      type: newQ.type,
      required: newQ.required,
    };
    if (newQ.type === 'select') {
      q.options = newQ.options.split(',').map(o => o.trim()).filter(Boolean);
    }
    if (newQ.type === 'rating') {
      q.max = Number(newQ.max) || 5;
    }
    setQuestions(prev => [...prev, q]);
    setNewQ({ label: '', type: 'number', options: '', required: false, max: 5 });
    setAddingQuestion(false);
  }

  function removeQuestion(id) {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function moveQuestion(index, dir) {
    setQuestions(prev => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }

  if (editingForm) {
    return (
      <>
        <div style={{ padding: '12px' }}>
          <div className="form-group">
            <label className="form-label">Form Name *</label>
            <input className="form-input" placeholder="e.g. Match Scouting" value={formName} onChange={e => setFormName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="What is this form for?" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
          </div>
        </div>

        <div className="section-title">Questions ({questions.length})</div>

        <div style={{ padding: '0 12px' }}>
          {questions.map((q, i) => (
            <div key={q.id} className="question-item">
              <div className="drag-handle" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="btn btn-sm" style={{ padding: 2, border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => moveQuestion(i, -1)}>&#9650;</button>
                <button className="btn btn-sm" style={{ padding: 2, border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => moveQuestion(i, 1)}>&#9660;</button>
              </div>
              <div className="question-item-content">
                <div style={{ fontWeight: 500, fontSize: 14 }}>{q.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6, marginTop: 2 }}>
                  <span className="badge badge-primary">{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                  {q.required && <span className="badge badge-warning">Required</span>}
                  {q.options && <span style={{ fontSize: 11 }}>{q.options.join(', ')}</span>}
                </div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => removeQuestion(q.id)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {addingQuestion ? (
            <div className="card" style={{ margin: '8px 0' }}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Question Label *</label>
                  <input className="form-input" placeholder="e.g. Specimens scored" value={newQ.label} onChange={e => setNewQ({ ...newQ, label: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Answer Type</label>
                  <select className="form-select" value={newQ.type} onChange={e => setNewQ({ ...newQ, type: e.target.value })}>
                    {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {newQ.type === 'select' && (
                  <div className="form-group">
                    <label className="form-label">Options (comma separated)</label>
                    <input className="form-input" placeholder="Option 1, Option 2, Option 3" value={newQ.options} onChange={e => setNewQ({ ...newQ, options: e.target.value })} />
                  </div>
                )}
                {newQ.type === 'rating' && (
                  <div className="form-group">
                    <label className="form-label">Max Rating</label>
                    <input className="form-input" type="number" min="3" max="10" value={newQ.max} onChange={e => setNewQ({ ...newQ, max: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <input type="checkbox" checked={newQ.required} onChange={e => setNewQ({ ...newQ, required: e.target.checked })} />
                    Required
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => setAddingQuestion(false)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn btn-primary" onClick={addQuestion} style={{ flex: 1 }}>Add Question</button>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary btn-block" onClick={() => setAddingQuestion(true)} style={{ marginTop: 8 }}>
              <Plus size={16} /> Add Question
            </button>
          )}
        </div>

        <div style={{ padding: '16px 12px', display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setEditingForm(null)} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={saveForm} style={{ flex: 2 }}>Save Form</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="section-title">Scouting Forms ({data.forms.length})</div>

      {data.forms.map(form => (
        <div key={form.id} className="card">
          <div className="card-header">
            <div>
              <div>{form.name}</div>
              <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)' }}>
                {form.questions.length} questions — {data.scoutingEntries.filter(e => e.formId === form.id).length} entries
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => duplicateForm(form)}><Copy size={12} /></button>
              <button className="btn btn-sm btn-secondary" onClick={() => startEdit(form)}><Edit2 size={12} /></button>
              <button className="btn btn-sm btn-secondary" onClick={() => deleteForm(form.id)}><Trash2 size={12} /></button>
            </div>
          </div>
          <div className="card-body">
            {form.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{form.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {form.questions.slice(0, 6).map(q => (
                <span key={q.id} className="chip">{q.label}</span>
              ))}
              {form.questions.length > 6 && <span className="chip">+{form.questions.length - 6} more</span>}
            </div>
          </div>
        </div>
      ))}

      <button className="btn-fab" onClick={startNew}>
        <Plus size={24} />
      </button>
    </>
  );
}
