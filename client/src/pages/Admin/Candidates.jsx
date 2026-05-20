import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    contestantId: "",
    name: "",
    Organization: "",
    description: "",
    imageUrl: "",
    electionId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candRes, elecRes] = await Promise.all([
        API.get("/admin/candidates"),
        API.get("/admin/elections"),
      ]);
      setCandidates(candRes.data.data);
      setElections(elecRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.electionId) return toast.error("Please select an election");
    try {
      if (editing) {
        await API.put(`/admin/candidates/${editing.id}`, form);
        toast.success("Candidate updated");
      } else {
        await API.post("/admin/candidates", form);
        toast.success("Candidate added");
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        contestantId: "",
        name: "",
        party: "",
        description: "",
        imageUrl: "",
        electionId: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      await API.delete(`/admin/candidates/${id}`);
      toast.success("Candidate deleted");
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const startEditing = (candidate) => {
    setEditing(candidate);
    setForm({
      contestantId: candidate.contestantId,
      name: candidate.name,
      party: candidate.party || "",
      description: candidate.description || "",
      imageUrl: candidate.imageUrl || "",
      electionId: candidate.electionId,
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-white">Loading candidates...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Candidates Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({
              contestantId: "",
              name: "",
              party: "",
              description: "",
              imageUrl: "",
              electionId: "",
            });
          }}
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl text-white"
        >
          + Add Candidate
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#070711] border border-white/10 rounded-xl p-6 mb-8"
        >
          <h2 className="text-white text-lg mb-4">
            {editing ? "Edit Candidate" : "Add Candidate"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="contestantId"
              placeholder="Contestant ID *"
              value={form.contestantId}
              onChange={(e) =>
                setForm({ ...form, contestantId: e.target.value })
              }
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
              required
            />
            <input
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
              required
            />
            <input
              name="party"
              placeholder="Party (optional)"
              value={form.party}
              onChange={(e) =>
                setForm({ ...form, organization: e.target.value })
              }
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
            />
            <input
              name="imageUrl"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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
            <select
              name="electionId"
              value={form.electionId}
              onChange={(e) => setForm({ ...form, electionId: e.target.value })}
              className="bg-[#12121b] border border-white/10 rounded-xl px-4 py-2 text-white"
              required
            >
              <option value="">Select Election</option>
              {elections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
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
              <th className="py-3 text-gray-400">Contestant ID</th>
              <th className="py-3 text-gray-400">Name</th>
              <th className="py-3 text-gray-400">Organization</th>
              <th className="py-3 text-gray-400">Election</th>
              <th className="py-3 text-gray-400">Votes</th>
              <th className="py-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b border-white/5">
                <td className="py-3 text-white">{candidate.contestantId}</td>
                <td className="py-3 text-gray-300">{candidate.name}</td>
                <td className="py-3 text-gray-300">{candidate.organization || "—"}</td>
                <td className="py-3 text-gray-300">
                  {candidate.election?.title || "—"}
                </td>
                <td className="py-3 text-gray-300">
                  {candidate._count?.votes || 0}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => startEditing(candidate)}
                    className="text-blue-400 hover:text-blue-300 mr-3 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCandidate(candidate.id)}
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

export default AdminCandidates;
