import React, { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Award,
  Plus,
  Printer,
  ExternalLink,
  Trash2,
  Edit2,
  FolderGit2,
  FileBadge,
  Briefcase,
  Trophy,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const ITEM_TYPES = [
  { id: 'project', label: 'Project', icon: FolderGit2 },
  { id: 'certificate', label: 'Certificate', icon: FileBadge },
  { id: 'internship', label: 'Internship', icon: Briefcase },
  { id: 'achievement', label: 'Achievement', icon: Trophy },
];

const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'project',
    title: '',
    description: '',
    link: '',
  });

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await portfolioApi.list();
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load portfolio items.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      type: 'project',
      title: '',
      description: '',
      link: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description,
      link: item.link || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await portfolioApi.update(editingItem.id, formData);
        toast.success('Portfolio item updated!');
      } else {
        await portfolioApi.create(formData);
        toast.success('Portfolio item created!');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await portfolioApi.delete(id);
      toast.success('Item deleted.');
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-brand-600" />
            <span>Digital Credential & Skills Portfolio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showcase verified projects, hackathon achievements, and industry internships to recruiters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPublicView(!isPublicView)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              isPublicView
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isPublicView ? 'Exit Public View' : 'Public Layout'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Public Shareable Header (Visible in Public / Print View) */}
      {isPublicView && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-brand-950 text-white shadow-xl mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified SKILLNEXUS Academic Portfolio</span>
              </div>
              <h2 className="text-3xl font-black">{user?.name}</h2>
              <p className="text-sm text-slate-300 mt-1">
                {user?.student_profile?.degree} • {user?.student_profile?.branch} ({user?.student_profile?.year})
              </p>
              <p className="text-xs text-brand-300 mt-0.5">{user?.organization}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-slate-400 block">Verified Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {Object.entries(user?.student_profile?.skills || {}).slice(0, 6).map(([s, lvl]) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                    {s} (Lvl {lvl})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Items Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const typeDef = ITEM_TYPES.find((t) => t.id === item.type) || ITEM_TYPES[0];
            const Icon = typeDef.icon;

            return (
              <Card key={item.id} hover={!isPublicView} className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="default" size="sm">
                        {typeDef.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}

                      {!isPublicView && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                {item.link && (
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>View Project Artifact</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center text-slate-400">
          <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Your portfolio is currently empty</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Add your flagship projects, certifications, and hackathon wins.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Project</span>
          </button>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Credential'}
        subtitle="Add evidence of your technical projects and achievements"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              {ITEM_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Distributed Cache in Python"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key technologies used, role, and measurable performance impact..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              External Link / Repository (Optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://github.com/username/project"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all active:scale-95"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Portfolio;
