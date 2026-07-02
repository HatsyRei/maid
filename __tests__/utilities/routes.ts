import RootLayout from "../../app/_layout";
import ChatLayout from "../../app/chat/_layout";
import Chat from "../../app/chat/index";
import Root from "../../app/index";
import Settings from "../../app/settings";

export default {
  "_layout": RootLayout,
  "index": Root,
  "chat/_layout": ChatLayout,
  "chat/index": Chat,
  "settings": Settings,
};