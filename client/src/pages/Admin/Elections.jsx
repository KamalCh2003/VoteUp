import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const AdminElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await API.get("/admin/elections");
      setElections(res.data.data);
    } catch (error) {
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/admin/elections/${editing.id}`, form);
        toast.success("Election updated");
      } else {
        await API.post("/admin/elections", form);
        toast.success("Election created");
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        title: "",
        description: "",
        category: "",
        startDate: "",
        endDate: "",
      });
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const deleteElection = async (id) => {
    if (
      !window.confirm(
        "Delete this election? All candidates and votes will be lost.",
      )
    )
      return;
    try {
      await API.delete(`/admin/elections/${id}`);
      toast.success("Election deleted");
      fetchElections();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const startEditing = (election) => {
    setEditing(election);
    setForm({
      title: election.title,
      description: election.description || "",
      category: election.category || "",
      startDate: election.startDate?.slice(0, 16) || "",
      endDate: election.endDate?.slice(0, 16) || "",
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-white">Loading elections...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Elections Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({
              title: "",
              description: "",
              category: "",
              startDate: "",
              endDate: "",
            });
          }}
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl text-white"
        >
          + New Election
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#070711] border border-white/10 rounded-xl p-6 mb-8"
        >
          <h2 className="text-white text-lg mb-4">
            {editing ? "Edit Election" : "Create Election"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
              required
            />
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white col-span-2"
              rows="2"
            />
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
            />
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr>
              <th className="py-3 text-gray-400">Title</th>
              <th className="py-3 text-gray-400">Category</th>
              <th className="py-3 text-gray-400">Status</th>
              <th className="py-3 text-gray-400">Candidates</th>
              <th className="py-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map((election) => (
              <tr key={election.id} className="border-b border-white/5">
                <td className="py-3 text-white">{election.title}</td>
                <td className="py-3 text-gray-300">
                  {election.category || "—"}
                </td>
                <td className="py-3 text-gray-300">{election.status}</td>
                <td className="py-3 text-gray-300">
                  {election._count?.candidates || 0}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => startEditing(election)}
                    className="text-blue-400 hover:text-blue-300 mr-3 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteElection(election.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminElections;
