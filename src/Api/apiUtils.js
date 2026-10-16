/**
 * ===========================================
 *  API Response Envelope Unwrapping Utilities
 * ===========================================
 *
 * Backend returns:
 *   Standard: { success: true, message: '...', data: <payload> }
 *   Paginated: { success: true, data: { data: [...rows], pagination: { currentPage, totalPages, totalCount } } }
 */

export const unwrap = (res) => {
  const payload = res?.data?.data ?? res?.data ?? null;
  if (payload && typeof payload === 'object' && !payload.data) {
    try {
      Object.defineProperty(payload, 'data', {
        value: payload,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    } catch {
      // ignore
    }
  }
  return payload;
};

export const unwrapPaginated = (res) => {
  const payload = res?.data?.data ?? res?.data;
  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.rows)
    ? payload.rows
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : [];

  const pagination = payload?.pagination || {
    currentPage: payload?.currentPage || 1,
    totalPages: payload?.totalPages || 1,
    totalCount: payload?.totalCount || payload?.count || items.length,
  };

  const total = pagination.totalCount ?? items.length;
  const totalPages = pagination.totalPages ?? 1;

  return {
    items,
    data: items,
    rows: items,
    total,
    total_pages: totalPages,
    pagination,
  };
};

export const unwrapList = (res) => {
  const payload = res?.data?.data ?? res?.data;
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  try {
    if (!list.data) {
      list.data = list;
    }
  } catch {
    // ignore
  }
  return list;
};

