const namespaces = [
  {
    title: "OS",
    endpoint: "/os",
    icon: "api",
    color: "red",
    rooms: [
      {
        title: "Windows",
        history: [],
      },
      {
        title: "Mac",
        history: [],
      },
      {
        title: "Linux",
        history: [],
      },
    ],
  },
  {
    title: "Browsers",
    endpoint: "/browsers",
    icon: "public",
    color: "green",
    rooms: [
      {
        title: "Chrome",
        history: [],
      },
      {
        title: "Firefox",
        history: [],
      },
      {
        title: "Edge",
        history: [],
      },
    ],
  },
];

module.exports = namespaces;
