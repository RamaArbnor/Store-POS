const PATHS = {
    dashboard:  'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    pos:        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 12h6 M9 16h4',
    products:   'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    stock:      'M9 17H7A5 5 0 017 7h2 M15 7h2a5 5 0 010 10h-2 M8 12h8',
    receive:    'M12 16V4 M8 8l4-4 4 4 M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2',
    adjust:     'M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z',
    reports:    'M18 20V10 M12 20V4 M6 20v-6',
    users:      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    logout:     'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
    plus:       'M12 5v14M5 12h14',
    edit:       'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    trash:      'M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2',
    check:      'M20 6L9 17l-5-5',
    x:          'M18 6L6 18M6 6l12 12',
    chevronDown:'M6 9l6 6 6-6',
    chevronRight:'M9 18l6-6-6-6',
    alert:      'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
    search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    scan:       'M4 7V4h3 M17 4h3v3 M4 17v3h3 M17 20h3v-3 M9 9h6v6H9z',
    calendar:   'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    info:       'M12 22a10 10 0 100-20 10 10 0 000 20z M12 8h.01 M12 12v4',
    key:        'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
    user:       'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8 4 4 0 000-8z',
    store:      'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    arrow_left: 'M19 12H5 M12 19l-7-7 7-7',
};

export default function Icon({ name, size = 16, className = '' }) {
    const d = PATHS[name] || '';
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={{ flexShrink: 0 }}
        >
            {d && <path d={d} />}
        </svg>
    );
}
