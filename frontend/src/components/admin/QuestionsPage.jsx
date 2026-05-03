import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { api } from '../../lib/api';
import { useToast } from '../../lib/ToastContext';

const QuestionEditor = ({ question, sections, onChange }) => {
  if (!question) return null;
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-brand-black">Question</label>
        <input
          value={question.question_text}
          onChange={(e) => onChange({ ...question, question_text: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-black">Type</label>
        <select
          value={question.type}
          onChange={(e) => onChange({ ...question, type: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        >
          <option value="LIKERT">Likert</option>
          <option value="OPEN_ENDED">Open-ended</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!question.is_required}
            onChange={(e) => onChange({ ...question, is_required: e.target.checked })}
          />
          <span className="text-sm">Required</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!question.is_active}
            onChange={(e) => onChange({ ...question, is_active: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-black">Section</label>
        <select
          value={question.section_id ?? ''}
          onChange={(e) => onChange({ ...question, section_id: e.target.value ? Number(e.target.value) : null })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        >
          <option value="">(none)</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-black">Order in section</label>
        <input
          type="number"
          value={question.order_in_section ?? 0}
          onChange={(e) => onChange({ ...question, order_in_section: Number(e.target.value) })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        />
      </div>
    </div>
  );
};

const QuestionsPage = () => {
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      // fetch all sections (including empty ones) and all questions
      const [secsResp, questionsResp] = await Promise.all([
        api.questionSections.listAll(),
        api.questions.findWithSections(),
      ]);

      // sections from backend include questions relation; normalize to expected shape
      const secs = Array.isArray(secsResp)
        ? secsResp.map((s) => ({ id: s.id, name: s.name, questions: Array.isArray(s.questions) ? s.questions : [] }))
        : [];

      // questions list (flat)
      const qs = Array.isArray(questionsResp) ? questionsResp : [];

      // Ensure that any question not assigned to a section goes into an "Uncategorized" pseudo-section
      const uncategorized = { id: null, name: 'Uncategorized', questions: [] };
      qs.forEach((q) => {
        const secId = q.section_id ?? null;
        const sec = secs.find((s) => (s.id ?? null) === secId);
        if (sec) {
          sec.questions.push(q);
        } else {
          uncategorized.questions.push(q);
        }
      });

      const finalSections = [...secs];
      if (uncategorized.questions.length > 0) finalSections.push(uncategorized);

      setSections(finalSections.sort((a, b) => (a.id === null ? 9999 : a.order ?? 0) - (b.id === null ? 9999 : b.order ?? 0)));
      setQuestions(qs);
    } catch (err) {
      showToast({ type: 'error', title: 'Unable to load questions', message: err.message || 'Try again' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEditor = (question = null) => {
    setEditing(question || { question_text: '', type: 'LIKERT', is_required: true, is_active: true, section_id: null, order_in_section: 0 });
    setIsEditingModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing.question_id) {
        await api.questions.update(editing.question_id, editing);
        showToast({ type: 'success', title: 'Updated', message: 'Question updated' });
      } else {
        await api.questions.create(editing);
        showToast({ type: 'success', title: 'Created', message: 'Question created' });
      }
      setIsEditingModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Save failed', message: err.message || 'Try again' });
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-12 bg-brand-bg min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-brand-black">Questions</h1>
          <p className="text-sm text-brand-grey">Manage evaluation form questions and sections.</p>
        </div>
        <div>
          <Button onClick={() => openEditor(null)} className="bg-brand-maroon text-white">Add Question</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {isLoading ? (
          <div>Loading questions...</div>
        ) : (
          <div className="space-y-6">
            {sections.map((sec) => (
              <div key={sec.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{sec.name}</h3>
                  <Button onClick={() => openEditor({ section_id: sec.id, question_text: '', type: 'LIKERT', is_required: true, is_active: true, order_in_section: sec.questions.length })}>Add in section</Button>
                </div>
                <ul className="space-y-2">
                  {sec.questions.map((q) => (
                    <li
                      key={q.question_id}
                      className="group flex items-center justify-between p-3 rounded-md border border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEditor(q)}
                    >
                      <div>
                        <div className="font-medium">{q.question_text}</div>
                        <div className="text-xs text-brand-grey">Type: {q.type} • Required: {q.is_required ? 'Yes' : 'No'} • Active: {q.is_active ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => { e.stopPropagation(); openEditor(q); }}
                          className="bg-white border opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editing?.question_id ? 'Edit Question' : 'Add Question'}</h2>
              <button onClick={() => { setIsEditingModalOpen(false); setEditing(null); }} className="text-brand-grey">Close</button>
            </div>

            <QuestionEditor question={editing} sections={sections} onChange={setEditing} />

            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => { setIsEditingModalOpen(false); setEditing(null); }} className="border">Cancel</Button>
              <Button onClick={handleSave} className="bg-brand-maroon text-white">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
