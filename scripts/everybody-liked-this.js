let socket;
let module;

class Status extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "elt-status",
      title: "Messages",
      template: `modules/everybodylikedthis/templates/status.hbs`,
      width: 300,
      height: 100,
      top: 80,
      left: 130,
      resizable: false,
      minimizable: false,
    });
  }
}

const getCurrentUser = () => game.users.current;

const sendApproval = (approval) => {
  const user = getCurrentUser();
  socket.executeForEveryone("approval", user.name, approval);
};

const cleanWindowClass = (application) => {
  const app = application.element[0];
  app.style.boxShadow = "none";
  app.style.background = "none";
  app.querySelector(".window-content").classList.remove("window-content");
  app.querySelector(".window-header").style.backgroundColor =
    "rgba(0, 0, 0, 0.5)";
  app.querySelector(".window-header").style.border = "0";
  Array.from(app.querySelectorAll("button")).forEach((el) =>
    app.querySelector(".window-header").appendChild(el)
  );
  app.querySelector(".close").remove();
};

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("everybodylikedthis");
  socket.register("approval", approval);
  console.log("The socket is ready to be used.");
});

Hooks.once("init", () => {
  console.log("Everybody Liked This | Initializing the module.");
  module = game.modules.get("everybodylikedthis");
  module.status = new Status();
  module.status.render(true);
});

Hooks.once("ready", async () => {
  cleanWindowClass(module.status);
  Array.from(
    module.status.element[0].querySelectorAll(".module-control")
  ).forEach((el) =>
    el.addEventListener("click", (event) => {
      sendApproval(event.currentTarget.dataset.approval === "true");
    })
  );
});

const approval = (user, approval) => {
  let newElement = document.createElement("div");
  //Add transition styles to the new element
  newElement.style.transition = "opacity 1s";
  newElement.style.paddingLeft = "8px";

  newElement.innerHTML = `<p>${user} ${
    approval ? "approves" : "disapproves"
  }.</p>`;
  module.status.element[0].querySelector(".statusbox").appendChild(newElement);

  //Set timer to first fade out and then remove the element after 5 seconds
  setTimeout(() => {
    newElement.style.opacity = 0;
    setTimeout(() => {
      newElement.remove();
    }, 1000);
  }, 5000);
};
