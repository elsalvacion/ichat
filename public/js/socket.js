document.addEventListener("DOMContentLoaded", () => {
  const namespaces_section = document.querySelector(".namespaces-section");
  const messageInput = document.querySelector("#message-input");
  const roomsSections = document.querySelectorAll(".rooms");
  const messages = document.querySelector(".messages");

  // Get username and room from URL
  const { username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  let socket = null;

  socket = io("https://i-chatapp.herokuapp.com", {
    query: {
      username,
    },
  });

  socket.on("allNamespaces", (namespaces) => {
    namespaces.forEach((ns) => {
      namespaces_section.innerHTML += `
      <div class="center namespace"  data-target="slide-out" data-title="${ns.title}" data-endpoint="${ns.endpoint}"
      data-position="right" data-tooltip="${ns.title}"
      >
      <a class="btn-floating waves-effect waves-light ${ns.color}"
        ><i class="material-icons">${ns.icon}</i></a
      >
    </div>
      `;
    });

    // join default ns
    const defaultEndpoint = namespaces[0].endpoint;

    socket = io(`https://i-chatapp.herokuapp.com${defaultEndpoint}`, {
      query: {
        username,
      },
    });

    // now load default ns rooms and join
    const defaultNsRooms = namespaces[0].rooms;
    roomsSections.forEach((roomsSection) => {
      roomsSection.innerHTML = "";
      defaultNsRooms.forEach((room) => {
        roomsSection.innerHTML += `
        <div class="room" data-title="${room.title}">${room.title}</div>
        `;
      });
    });

    socket.emit("joinRoom", defaultNsRooms[0].title);

    document.querySelector(
      ".roomHeading"
    ).innerHTML = `#${defaultNsRooms[0].title}`;

    socket.on("history", (history) => {
      history.forEach((msg) => {
        messages.innerHTML += `
        <div class="message">
        <div class="sender">${msg.sender}</div>
       <div class="text">
         ${msg.text}
       </div>
        <div class="time">${msg.time}</div>
      </div>
        `;
      });
    });

    // time send some messages
    document.querySelector(".texting-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (messageInput.value !== "") {
        socket.emit("messageFromClient", messageInput.value);
      }

      messageInput.value = "";
    });

    // get message from server
    socket.on("messageFromServer", (msg) => {
      messages.innerHTML += `
      <div class="message ${msg.sck === socket.id ? "to-right" : null}">
      <div class="sender">${msg.sender}</div>
     <div class="text">
       ${msg.text}
     </div>
      <div class="time">${msg.time}</div>
    </div>
      `;

      window.scrollTo(0, document.body.scrollHeight);
    });

    // now listen for a click in a selected room
    Array.from(document.querySelectorAll(".room")).forEach((room) => {
      room.addEventListener("click", (e) => {
        const title = room.getAttribute("data-title");
        // join this room
        socket.emit("joinRoom", title);

        document.querySelector(".roomHeading").innerHTML = `#${title}`;

        socket.on("history", (history) => {
          messages.innerHTML = "";
          history.forEach((msg) => {
            messages.innerHTML += `
                                      <div class="message">
                                      <div class="sender">${msg.sender}</div>
                                     <div class="text">
                                       ${msg.text}
                                     </div>
                                      <div class="time">${msg.time}</div>
                                    </div>
                                      `;
          });
        });
      });
    });

    // listen to nasmespaces clicks
    Array.from(document.querySelectorAll(".namespace")).forEach((ns) => {
      ns.addEventListener("click", (e) => {
        const endpoint = ns.getAttribute("data-endpoint");

        const title = ns.getAttribute("data-title");

        if (socket) {
          socket.close();
        }

        socket = io(`https://i-chatapp.herokuapp.com${endpoint}`, {
          query: {
            username,
          },
        });

        messages.innerHTML = "";

        socket.on("rooms", (rooms) => {
          // automatically join first room
          // join this room
          socket.emit("joinRoom", rooms[0].title);

          document.querySelector(
            ".roomHeading"
          ).innerHTML = `#${rooms[0].title}`;

          roomsSections.forEach((roomsSection) => {
            roomsSection.innerHTML = "";
            rooms.forEach((room) => {
              roomsSection.innerHTML += `
              <div class="room" data-title="${room.title}">${room.title}</div>
              `;
            });

            // now listen for a click in a selected room
            Array.from(document.querySelectorAll(".room")).forEach((room) => {
              room.addEventListener("click", (e) => {
                const title = room.getAttribute("data-title");
                // join this room
                socket.emit("joinRoom", title);
                document.querySelector(".roomHeading").innerHTML = `#${title}`;
              });

              socket.on("history", (history) => {
                messages.innerHTML = "";

                history.forEach((msg) => {
                  messages.innerHTML += `
                                      <div class="message">
                                      <div class="sender">${msg.sender}</div>
                                     <div class="text">
                                       ${msg.text}
                                     </div>
                                      <div class="time">${msg.time}</div>
                                    </div>
                                      `;
                });
              });

              // time send some messages
              document
                .querySelector(".texting-form")
                .addEventListener("submit", (e) => {
                  e.preventDefault();
                  if (messageInput.value !== "")
                    socket.emit("messageFromClient", messageInput.value);

                  messageInput.value = "";
                });
            });
          });
        });

        // get message from server
        socket.on("messageFromServer", (msg) => {
          messages.innerHTML += `
      <div class="message ${msg.sck === socket.id ? "to-right" : null}">
      <div class="sender">${msg.sender}</div>
     <div class="text">
       ${msg.text}
     </div>
      <div class="time">${msg.time}</div>
    </div>
      `;
          window.scrollTo(0, document.body.scrollHeight);
        });
      });
    });
  });
});

// for sidenav stuff
$(document).ready(function () {
  $(".sidenav").sidenav();
});

// tooltip
$(document).ready(function () {
  $(".tooltipped").tooltip();
});
