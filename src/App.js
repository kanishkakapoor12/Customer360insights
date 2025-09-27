import React, { useEffect, useMemo, useState } from 'react';
import './style.css';

// Customer 360 Insights Portal


function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}



function CustomerCard({ customer, onInlineSave }) {
  const [editing, setEditing] = useState({});
  const [draft, setDraft] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  });
  useEffect(() => {
    setDraft({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  }, [customer]);

  function startEdit(field) {
    setEditing((s) => ({ ...s, [field]: true }));
  }
  function cancelEdit(field) {
    setEditing((s) => ({ ...s, [field]: false }));
    setDraft({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  }
  function save(field) {
    onInlineSave(customer.id, { [field]: draft[field] });
    setEditing((s) => ({ ...s, [field]: false }));
  }

  return (
    <div className="customer-card">
      <div className="avatar">
        {customer.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')}
      </div>
      <div className="customer-details">
        <div className="customer-header">
          <div className="customer-name">{customer.name}</div>
          <div className="customer-company">{customer.company?.name}</div>
        </div>
        <div className="customer-meta">
          <div>
            <strong>Email:</strong>
            {editing.email ? (
              <span>
                <input
                  value={draft.email}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, email: e.target.value }))
                  }
                />
                <button onClick={() => save('email')}>Save</button>
                <button onClick={() => cancelEdit('email')}>Cancel</button>
              </span>
            ) : (
              <span>
                {customer.email}{' '}
                <button onClick={() => startEdit('email')}>Edit</button>
              </span>
            )}
          </div>
          <div>
            <strong>Phone:</strong>
            {editing.phone ? (
              <span>
                <input
                  value={draft.phone}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, phone: e.target.value }))
                  }
                />
                <button onClick={() => save('phone')}>Save</button>
                <button onClick={() => cancelEdit('phone')}>Cancel</button>
              </span>
            ) : (
              <span>
                {customer.phone}{' '}
                <button onClick={() => startEdit('phone')}>Edit</button>
              </span>
            )}
          </div>
          <div>
            <strong>Location:</strong> {customer.address?.city},{' '}
            {customer.address?.street}
          </div>
        </div>
      </div>
    </div>
  );
}



export default function Customer360Portal() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 250);
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const withMeta = data.map((d) => ({
          ...d,
          createdAt: new Date().toISOString(),
        }));
        setCustomers(withMeta);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || 'Unknown error');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const companyOptions = useMemo(() => {
    const s = new Set(customers.map((c) => c.company?.name).filter(Boolean));
    return Array.from(s).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    let list = customers.slice();
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.address?.city || '').toLowerCase().includes(q)
      );
    }
    if (companyFilter) {
      list = list.filter((c) => c.company?.name === companyFilter);
    }
    if (sortBy) {
      const [k, dir] = sortBy.split('_');
      list.sort((a, b) => {
        const va = (a[k] || '').toString().toLowerCase();
        const vb = (b[k] || '').toString().toLowerCase();
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [customers, debouncedSearch, companyFilter, sortBy]);

  function handleAddCustomer(payload) {
    const id = Math.max(0, ...customers.map((c) => c.id || 0)) + 1;
    const record = { id, ...payload, createdAt: new Date().toISOString() };
    setCustomers((s) => [record, ...s]);
    setAddOpen(false);
  }

  function handleInlineSave(id, patch) {
    setCustomers((s) => s.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setTimeout(() => {
      const fail = Math.random() < 0.06;
      if (fail) {
        setError('Failed to save changes. Try again.');
      }
    }, 600);
  }

  return (
    <div className="portal">
      <header className="portal-header">
        <h1>Customer 360 Insights</h1>
        <p>
          View and manage customer data — search, filter, inline edit and add
          new customers.
        </p>
      </header>


      <main>
        {loading ? (
          <div className="status-box">Loading customers...</div>
        ) : error ? (
          <div className="error-box">Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="status-box">No customers found.</div>
        ) : (
          <div className="customer-grid">
            {filtered.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                onInlineSave={handleInlineSave}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="portal-footer">
        Data source: JSONPlaceholder (demo). Inline edits are local-only
        (simulated).
      </footer>

     
    </div>
  );
}


