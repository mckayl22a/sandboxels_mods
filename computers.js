// Lua Computer Mod for Sandboxels
// Requires Fengari (Lua VM in JS)
//
// Save this file into your mods folder and load it with Sandboxels.

// Make sure Fengari is loaded:
// <script src="https://unpkg.com/fengari-web/dist/fengari-web.js"></script>

if (typeof fengari === "undefined") {
    console.error("Fengari (Lua VM) is required for this mod.");
}

// Define the Lua computer element
elements["luacomputer"] = {
    color: "#4444aa",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,
    properties: {
        code: "-- write Lua code here\nprint('Hello from Lua!')",
        output: "",
        running: false
    },
    tick: function(pixel) {
        if (pixel.running) return;

        try {
            const lua = fengari.load(pixel.code);
            const result = lua();
            pixel.output = result !== undefined ? result.toString() : "(no output)";
        } catch (e) {
            pixel.output = "Error: " + e.message;
        }

        pixel.running = true;
    },
    desc: "A programmable Lua computer. Right-click to edit code."
};

// Right-click menu for editing Lua code
if (typeof editPixel === "function") {
    let oldEdit = editPixel;
    editPixel = function(pixel) {
        if (pixel.element === "luacomputer") {
            let newCode = prompt("Enter Lua code:", pixel.code);
            if (newCode !== null) {
                pixel.code = newCode;
                pixel.running = false;
            }
        } else {
            oldEdit(pixel);
        }
    }
}
