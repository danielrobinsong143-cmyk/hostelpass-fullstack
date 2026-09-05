const PATHS = {
  dashboard: "M4 13.5V20h6v-6.5H4Zm0-3h6V4H4v6.5Zm10 9.5h6v-6.5h-6V20Zm0-10h6V4h-6v6.5Z",
  pass: "M6 3.5h9.5L19 7v13.5H6V3.5Zm8.5 0V8H19M9 12h7M9 15.5h5",
  requests: "M5 4.5h14v15H5v-15Zm3 3h8M8 11h8M8 14.5h5",
  profile: "M12 12a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 12 12Zm-6 7.5a6 6 0 0 1 12 0",
  logout: "M10 5H5v14h5M14 8l4 4-4 4M18 12H9",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  bell: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9Zm-8.5 11h5",
  search: "m20 20-3.7-3.7M10.8 17a6.2 6.2 0 1 1 0-12.4 6.2 6.2 0 0 1 0 12.4Z",
  check: "m5 12 4.2 4.2L19 6.5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2",
  x: "m7 7 10 10M17 7 7 17",
  chart: "M4 18V6m0 12h16M7 15l3-4 3 2 4-6",
  arrow: "M5 12h13m-5-5 5 5-5 5",
  eye: "M2.5 12s3.2-5 9.5-5 9.5 5 9.5 5-3.2 5-9.5 5-9.5-5-9.5-5Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  user: "M12 12a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 12 12Zm-6 7.5a6 6 0 0 1 12 0",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-12 0V7a5 5 0 0 1 10 0v4",
  refresh: "M21.5 2v6h-6M21.34 15.57a9 9 0 1 1-.57-8.38l5.67-1.19",
  shield: "M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13v2m0 14v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon: "M20.5 14.8A8.5 8.5 0 0 1 9.2 3.5 8.5 8.5 0 1 0 20.5 14.8Z",
};

function UiIcon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  const path = PATHS[name] || PATHS.dashboard;

  return (
    <svg
      className={`ui-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default UiIcon;
