'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

export type Field = { key: string; label: string; type?: string; required?: boolean };
type Row = { id: string } & Record<string, string | null>;
type Values = Record<string, string>;

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : (msg ?? `Request failed (${res.status})`));
  }
  return data as T;
}

const blank = (fields: Field[]): Values =>
  Object.fromEntries(fields.map((f) => [f.key, '']));

export default function ResourcePanel({
  title,
  path,
  fields,
}: {
  title: string;
  path: string;
  fields: Field[];
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Values>(blank(fields));
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Values>(blank(fields));

  const load = useCallback(async () => {
    try {
      setRows(await request<Row[]>('GET', path));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  // run an action, then refresh the list; show any API error next to the panel
  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      setError('');
      await load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    // optional fields left empty are omitted so the API keeps its default
    const body = Object.fromEntries(
      fields.filter((f) => f.required || form[f.key] !== '').map((f) => [f.key, form[f.key]]),
    );
    if (await run(() => request('POST', path, body))) setForm(blank(fields));
  }

  function startEdit(row: Row) {
    setEditId(row.id);
    setEdit(Object.fromEntries(fields.map((f) => [f.key, row[f.key] ?? ''])));
  }

  async function onSave(id: string) {
    if (await run(() => request('PATCH', `${path}/${id}`, edit))) setEditId(null);
  }

  async function onDelete(id: string) {
    if (confirm('Delete this record?')) await run(() => request('DELETE', `${path}/${id}`));
  }

  return (
    <section>
      <h2>{title}</h2>

      <form className="row" onSubmit={onCreate}>
        {fields.map((f) => (
          <input
            key={f.key}
            type={f.type ?? 'text'}
            placeholder={f.label}
            aria-label={f.label}
            required={f.required}
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        ))}
        <button type="submit">Add</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <table>
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.key}>{f.label}</th>
            ))}
            <th className="actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {fields.map((f) => (
                <td key={f.key}>
                  {editId === row.id ? (
                    <input
                      type={f.type ?? 'text'}
                      aria-label={f.label}
                      value={edit[f.key]}
                      onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                    />
                  ) : (
                    (row[f.key] ?? '')
                  )}
                </td>
              ))}
              <td className="actions">
                {editId === row.id ? (
                  <>
                    <button onClick={() => onSave(row.id)}>Save</button>
                    <button className="ghost" onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="ghost" onClick={() => startEdit(row)}>Edit</button>
                    <button className="ghost danger" onClick={() => onDelete(row.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={fields.length + 1} className="empty">Nothing here yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
