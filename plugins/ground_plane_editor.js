(async function() {
    let aboutAction, action
    const id = "ground_plane_editor"
    const name = "Ground Plane Editor"
    const icon = "icon-format_free"
    const author = "SirJain"

    // Store the ground plane material in a dialog
    let groundPlane = Canvas.ground_plane.material

    // localStorage variables
    let localStorageColor = localStorage.getItem("groundPlaneColor")
    let localStorageOpacity = localStorage.getItem("groundPlaneOpacity")

    const links = {
        twitter: "https://www.twitter.com/SirJain2",
        discordlink: "https://discord.gg/wM4CKTbFVN"
    }

    // Register plugin
    Plugin.register(id, {
        title: name,
        icon,
        author,
        description: "Edits the opacity and color of the ground plane feature in Blockbench.",
        about: "This simple plugin allows you to customize the ground plane feature in Blockbench; more specifically, the opacity and color.\n## How to use\nTo use this plugin, simply go to `Tools > Ground Plane Editor`, fill out the appropriate categories, and hit `Done`. You can choose to edit either the color, the opacity, or both!\n\nPlease report any bugs or suggestions you may have.",
        tags: ["Ground Plane", "Animation", "Customization"],
        version: "1.1.0",
        min_version: "4.2.0",
        variant: "both",

        oninstall() {
            showAbout(true)
            Blockbench.showQuickMessage("Successfully Installed Ground Plane Editor!");
        },
        onuninstall() {
            Blockbench.showQuickMessage("Uninstalled Ground Plane Editor");
        },
        onload() {
            addAbout()

            // Handles the ground plane on loading the plugin
            groundPlane.transparent = true;

            if (localStorageColor) groundPlane.color.setHex(JSON.parse(localStorageColor))
            else groundPlane.color.setHex(parseInt("#21252B".substring(1), 16))

            if (localStorageOpacity) groundPlane.opacity = localStorageOpacity
            else groundPlane.opacity = 1

            // Defines the Menu action
            action = new Action({
                id,
                name: "Edit Ground Plane",
                icon,
                condition: () => Format?.id !== "image",
                click() {
                    const timeout = {
                        example: null
                    }

                    // Dialog to edit ground plane
                    const dialog = new Dialog({
                        title: "Edit Ground Plane",
                        id: "edit_ground_plane_dialog",
                        lines: [`
                            <li></li>
                            <style>
                                dialog#edit_ground_plane_dialog .bar {
                                    display: flex;
                                    align-items: center;
                                    margin: 0!important;
                                    height: 30px;
                                    box-sizing: content-box;
                                    overflow: hidden;
                                }

                                dialog#edit_ground_plane_dialog input[type=range] {
                                    flex-grow: 1;
                                    margin-left: 50px;
                                }

                                dialog#edit_ground_plane_dialog input[type=number] {
                                    margin: 0 8px 0 2px;
                                }
                            </style>
                        `],
                        component: {

                            // Method runs when the dialog is opened
                            mounted() {
                                this.$nextTick().then(() => {
                                    let opacityScaled = Math.floor(groundPlane.opacity * 255);
                                    $("dialog#edit_ground_plane_dialog .slider_input_combo #opacity_number").val(opacityScaled);
                                    $("dialog#edit_ground_plane_dialog .slider_input_combo #opacity_slider").val(opacityScaled);

                                    let planeColor = '#' + groundPlane.color.getHexString()
                                    $("dialog#edit_ground_plane_dialog .color_picker input").val(planeColor);
                                });
                            },
                            template: `
                                <div>
                                    <div class="bar slider_input_combo">
                                        <p>Edit Opacity:</p>
                                        <input id="opacity_slider" type="range" min="60" max="255" value="255" @input="changeSlider('opacity')"></input>
                                        <input id="opacity_number" type="number" class="tool" min="60" max="255" value="255" @input="changeNumber('opacity', 60, 255, 255)"></input>
                                    </div>
                                    <br>
                                    <div class="color_picker">
                                        <p>Edit Color:</p>
                                        <input type="color" value="#4a4a4a">
                                    </div>
                                    <br>
                                    <div style="display:flex;gap:8px">
                                        <button @click="revert()">Reset Values</button>
                                        <span style="flex-grow:3"></span>
                                        <button @click="create()">Done</button>
                                        <button @click="close()">Cancel</button>
                                    </div>
                                </div>
                            `,
                            methods: {
                                changeSlider(type) {
                                    const slider = $(`dialog#edit_ground_plane_dialog #${type}_slider`)
                                    const number = $(`dialog#edit_ground_plane_dialog #${type}_number`)
                                    const num = parseInt(slider.val())
                                    number.val(slider.val())
                                },

                                changeNumber(type, min, max, num) {
                                    const slider = $(`dialog#ground_plane_editor_dialog #${type}_slider`)
                                    const number = $(`dialog#edit_ground_plane_dialog #${type}_number`)
                                    const clamped = Math.min(max, Math.max(min, parseInt(number.val())))
                                    slider.val(number.val())
                                    clearTimeout(timeout[type])
                                    timeout[type] = setTimeout(() => {
                                        if (isNaN(clamped)) {
                                            number.val(num)
                                            slider.val(num)
                                        } else {
                                            number.val(clamped)
                                            slider.val(clamped)
                                        }
                                    }, 1000)
                                },

                                create() {

                                    // Handle the color
                                    let hexString = $("dialog#edit_ground_plane_dialog .color_picker input").val();
                                    let parsedIntColor = parseInt(hexString.substring(1), 16)
                                    groundPlane.color.setHex(parsedIntColor)
                                    localStorage.setItem("groundPlaneColor", parsedIntColor)

                                    // Hande the opacity
                                    let opacity = $("dialog#edit_ground_plane_dialog .slider_input_combo #opacity_number").val();
                                    let parsedOpacity = parseInt(opacity) / 255
                                    groundPlane.opacity = parsedOpacity;
                                    localStorage.setItem("groundPlaneOpacity", parsedOpacity)

                                    this.close()
                                    Blockbench.showQuickMessage("Updated successfully", 2000)
                                },

                                revert() {
                                    $("dialog#edit_ground_plane_dialog .color_picker input").val("#21252B");
                                    $("dialog#edit_ground_plane_dialog .slider_input_combo #opacity_number").val(255);
                                    $("dialog#edit_ground_plane_dialog .slider_input_combo #opacity_slider").val(255);
                                },

                                close: () => dialog.cancel()
                            }
                        },
                        buttons: [],
                        onConfirm() {
                            this.content_vue.create();
                        }
                    }).show()
                }
            })
            MenuBar.addAction(action, "tools")
        },

        onunload() {
            aboutAction.delete()
            action.delete()

            // Reset values if plugin is uninstalled
            localStorage.removeItem("groundPlaneColor")
            localStorage.removeItem("groundPlaneOpacity")
            groundPlane.color.setHex(parseInt("#21252B".substring(1), 16))
            groundPlane.opacity = 1

            MenuBar.removeAction(`help.about_plugins.about_${id}`)
        }
    })

    // Adds about dialog
    function addAbout() {
        let about = MenuBar.menus.help.structure.find(e => e.id === "about_plugins")

        if (!about) {
            about = new Action("about_plugins", {
                name: "About Plugins...",
                icon: "info",
                children: []
            })
            MenuBar.addAction(about, "help")
        }

        aboutAction = new Action(`about_${id}`, {
            name: `About ${name}...`,
            icon,
            click: () => showAbout()
        })

        about.children.push(aboutAction)
    }

    function showAbout(banner) {
        const infoBox = new Dialog({
            id: "about",
            title: name,
            width: 780,
            buttons: [],
            lines: [`
                <li></li>
                <style>
                    dialog#about .dialog_title {
                        padding-left: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    dialog#about .dialog_content {
                        text-align: left!important;
                        margin: 0!important;
                    }

                    dialog#about .socials {
                        padding: 0!important;
                    }

                    dialog#about #banner {
                        background-color: var(--color-accent);
                        color: var(--color-accent_text);
                        width: 100%;
                        padding: 0 8px
                    }

                    dialog#about #content {
                        margin: 24px;
                    }
                </style>
                ${banner ? `<div id="banner">This window can be reopened at any time from <strong>Help > About Plugins > ${name}</strong></div>` : ""}
                <div id="content">
                    <h1 style="margin-top:-10px">${name}</h1>
                    <p>This plugin is used for changing the opacity and color of the ground plane feature in Blockbench.</p>
                    <h4>Worth noting:</h4>
                    <p>- There is currently no way to revert back to the default ground plane. However, adding this feature is planned. For now you'll have to uninstall the plugin and restart Blockbench to revert back to the default.</p>
                    <p>- Just like the default ground plane, changing it's properties in one tab will update in other tabs as well.</p>
                    <h4>How to use:</h4>
                    <p>To use this plugin, simply go to <b>Tools > Ground Plane Editor</b>, fill out the appropriate categories, and hit <b>Done</b>. You can choose to edit either the color, the opacity, or both!</p>
                    <p>Please report any bugs or suggestions you may have to make this plugin more enjoyable for everyone.</p>
                    <br>
                    <div class="socials">
                        <a href="${links["twitter"]}" class="open-in-browser">
                            <i class="fa-brands fa-twitter" style="color:#00acee"></i>
                            <label>By ${author}</label>
                        </a>
                        <a href="${links["discordlink"]}" class="open-in-browser">
                            <i class="fa-brands fa-discord" style="color:#5865F2"></i>
                            <label>Discord Server</label>
                        </a>
                    </div>
                </div>
            `]
        }).show()
        $("dialog#about .dialog_title").html(`
            <i class="icon material-icons">${icon}</i>
            ${name}
        `)
    }
})()