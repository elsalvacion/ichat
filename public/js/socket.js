document.addEventListener("DOMContentLoaded", () => {
  const namespaces_section = document.querySelector(".namespaces-section");
  const messageInput = document.querySelector("#message-input");
  const roomsSections = document.querySelectorAll(".rooms");

  const messages = document.querySelector(".messages");

  const mainNs = io("http://localhost:5000");

  mainNs.on("allNamespaces", (namespaces) => {
    namespaces.forEach((ns) => {
      namespaces_section.innerHTML += `
      <div class="center namespace"  data-target="slide-out" data-title="${ns.title}" data-endpoint="${ns.endpoint}">
      <a class="btn-floating waves-effect waves-light ${ns.color}"
        ><i class="material-icons">${ns.icon}</i></a
      >
    </div>
      `;
    });

    // join default ns
    const defaultEndpoint = namespaces[0].endpoint;
    const defaultNs = io(`http://localhost:5000${defaultEndpoint}`);

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

    defaultNs.emit("joinRoom", defaultNsRooms[0].title);

    defaultNs.on("history", (history) => {
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
      if (messageInput.value !== "")
        defaultNs.emit("messageFromClient", messageInput.value);

      messageInput.value = "";
    });

    // get message from server
    defaultNs.on("messageFromServer", (msg) => {
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

    // now listen for a click in a selected room
    Array.from(document.querySelectorAll(".room")).forEach((room) => {
      room.addEventListener("click", (e) => {
        const title = room.getAttribute("data-title");
        // join this room
        defaultNs.emit("joinRoom", title);
        messages.innerHTML = "";
        defaultNs.on("history", (history) => {
          console.log(history);
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

        const newNs = io(`http://localhost:5000${endpoint}`);

        messages.innerHTML = "";

        newNs.on("rooms", (rooms) => {
          roomsSections.forEach((roomsSection) => {
            roomsSection.innerHTML = "";
            rooms.forEach((room) => {
              roomsSection.innerHTML += `
              <div class="room" data-title="${room.title}">${room.title}</div>
              `;
            });
          });
        });

        // now listen for a click in a selected room
        Array.from(document.querySelectorAll(".room")).forEach((room) => {
          room.addEventListener("click", (e) => {
            const title = room.getAttribute("data-title");
            // join this room
            newNs.emit("joinRoom", title);
            messages.innerHTML = "";
            newNs.on("history", (history) => {
              console.log(history);

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

        // time send some messages
        document
          .querySelector(".texting-form")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            if (messageInput.value !== "")
              newNs.emit("messageFromClient", messageInput.value);

            messageInput.value = "";
          });

        // get message from server
        newNs.on("messageFromServer", (msg) => {
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
});
