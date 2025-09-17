"use client";

import { useEffect, useMemo, useState } from "react";

type Post = {
  id: number;
  text: string;
  platform: string;
  status: "FLAGGED" | "UNDER_REVIEW" | "DISMISSED";
  tags: string[];
  createdAt: string;
};

type ApiResponse = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
  data: Post[];
};

export default function PostsView() {
  const [status, setStatus] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [newTag, setNewTag] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (platform) p.set("platform", platform);
    if (search) p.set("search", search);
    p.set("limit", String(limit));
    p.set("offset", String(offset));
    return p.toString();
  }, [status, platform, search, limit, offset]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/posts?${query}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: ApiResponse) => setResp(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setOffset(0);
  }, [status, platform, search, limit]);

  async function updateStatus(id: number, next: Post["status"]) {
    const res = await fetch(`/api/posts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
    const updated: Post = await res.json();

    // Update local table state so UI reflects change immediately
    setResp((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((p) => (p.id === id ? updated : p)),
          }
        : prev
    );
  }
  async function addTagToPost(id: number, tag: string) {
    const t = tag.trim();
    if (!t) return;
    const res = await fetch(`/api/posts/${id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: t }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`POST failed: ${res.status}`);
    const updated: Post = await res.json();

    // update just this row
    setResp((prev) =>
      prev
        ? { ...prev, data: prev.data.map((p) => (p.id === id ? updated : p)) }
        : prev
    );
    // clear the input for this row
    setNewTag((s) => ({ ...s, [id]: "" }));
  }
  async function removeTagFromPost(id: number, tag: string) {
    await fetch(`/api/posts/${id}/tags/${encodeURIComponent(tag)}`, {
      method: "DELETE",
    });
    // optimistic update
    setResp((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((post) =>
              post.id === id
                ? { ...post, tags: post.tags.filter((t) => t !== tag) }
                : post
            ),
          }
        : prev
    );
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="FLAGGED">FLAGGED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option>twitter</option>
            <option>facebook</option>
            <option>instagram</option>
            <option>tiktok</option>
            <option>reddit</option>
            <option>telegram</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500">Search</label>
          <input
            className="border rounded px-2 py-1"
            placeholder="Search text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500">Per page</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-4">
        {loading && <div className="text-sm text-gray-500">Loading…</div>}

        {error && <div className="text-sm text-red-600">Error: {error}</div>}

        {resp && resp.data.length === 0 && (
          <div className="text-sm text-gray-500">No posts found.</div>
        )}

        {resp && resp.data.length > 0 && (
          <>
            <div className="text-xs text-gray-500 mb-2">
              Showing {resp.data.length} of {resp.total}
            </div>
            <div className="overflow-x-auto rounded border">
              <table className="min-w-[800px] w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-2 border-b">Text</th>
                    <th className="p-2 border-b">Platform</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b">Tags</th>
                    <th className="p-2 border-b">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {resp.data.map((p) => (
                    <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 align-top max-w-[420px]">
                        <div className="line-clamp-3">{p.text}</div>
                      </td>
                      <td className="p-2 align-top">{p.platform}</td>
                      <td className="p-2 align-top">
                        <select
                          className="border rounded px-2 py-1 text-xs"
                          value={p.status}
                          onChange={async (e) => {
                            const next = e.target.value as Post["status"];
                            try {
                              await updateStatus(p.id, next);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        >
                          <option value="FLAGGED">FLAGGED</option>
                          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                          <option value="DISMISSED">DISMISSED</option>
                        </select>
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 text-xs border rounded px-2 py-0.5"
                            >
                              {t}
                              <button
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Remove tag ${t}`}
                                onClick={async () => {
                                  try {
                                    await removeTagFromPost(p.id, t);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add tag inline */}
                        <div className="flex items-center gap-2">
                          <input
                            className="border rounded px-2 py-0.5 text-xs"
                            placeholder="Add tag…"
                            value={newTag[p.id] ?? ""}
                            onChange={(e) =>
                              setNewTag((s) => ({
                                ...s,
                                [p.id]: e.target.value,
                              }))
                            }
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                await addTagToPost(p.id, newTag[p.id] ?? "");
                              }
                            }}
                          />
                          <button
                            className="border rounded px-2 py-0.5 text-xs"
                            onClick={async () => {
                              await addTagToPost(p.id, newTag[p.id] ?? "");
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </td>

                      <td className="p-2 align-top">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2 mt-3">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="border rounded px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={!resp.hasMore}
                onClick={() => setOffset(offset + limit)}
                className="border rounded px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
              <span className="text-xs text-gray-500">
                offset {offset} / total {resp.total}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
