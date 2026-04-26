import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { apiRequest } from '../../api';

const pickFirst = (...values) => values.find((value) => typeof value === 'string' && value.trim() !== '') || '';

const normalizeUser = (raw) => {
  const firstName = pickFirst(raw?.first_name, raw?.prenom, raw?.employee?.prenom, raw?.employe?.prenom);
  const lastName = pickFirst(raw?.last_name, raw?.nom, raw?.employee?.nom, raw?.employe?.nom);
  const fullNameFromParts = `${firstName} ${lastName}`.trim();

  const fullName = pickFirst(
    raw?.full_name,
    raw?.fullname,
    raw?.name,
    raw?.employee?.full_name,
    raw?.employee?.name,
    raw?.employe?.full_name,
    raw?.employe?.name,
    fullNameFromParts
  );

  const post = pickFirst(
    raw?.post,
    raw?.poste,
    raw?.job_title,
    raw?.position,
    raw?.employee?.post,
    raw?.employee?.poste,
    raw?.employee?.job_title,
    raw?.employe?.post,
    raw?.employe?.poste
  );

  const role = pickFirst(
    raw?.role,
    raw?.user_role,
    raw?.employee?.role,
    raw?.employe?.role
  ) || 'employee';

  const email = pickFirst(raw?.email, raw?.employee?.email, raw?.employe?.email);
  const id = raw?.id ?? raw?.user_id ?? raw?.id_user ?? raw?.id_employe ?? raw?.employee?.id ?? raw?.employe?.id;

  return {
    ...raw,
    id,
    name: fullName || email || `Utilisateur #${id ?? ''}`,
    full_name: fullName || '',
    post,
    role,
    email,
  };
};

const normalizeUsersPayload = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload?.eligible_users)
          ? payload.eligible_users
          : [];

  const normalized = list
    .map(normalizeUser)
    .filter((user) => user?.id != null);

  const seen = new Set();
  return normalized.filter((user) => {
    if (seen.has(user.id)) return false;
    seen.add(user.id);
    return true;
  });
};

const UserSelector = ({ onSelectUser, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEligibleUsers = async () => {
      try {
        const result = await apiRequest('/api/dm/eligible-users');
        setUsers(normalizeUsersPayload(result));
      } catch (err) {
        console.error('Error fetching eligible users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEligibleUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.role || '').toLowerCase().includes(query) ||
      (user.post || '').toLowerCase().includes(query)
    );
  });

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'rh': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'manager': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <UserPlus size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Nouvelle conversation</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-400"
            autoFocus
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600 flex items-center justify-center text-blue-700 dark:text-gray-300 font-bold text-sm flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {user.post ? `${user.post} - ${user.name}` : user.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email || user.post || ' '}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelector;
