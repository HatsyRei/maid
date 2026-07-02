import { fireEvent, renderRouter, screen } from "expo-router/testing-library";
import routes from "./utilities/routes";

describe("Chat page", () => {
  beforeEach(() => renderRouter(routes, { initialUrl: "/chat" }));

  it("should render the chat page", async () => {
    const chatPage = await screen.findByTestId("chat-page");
    expect(chatPage).toBeOnTheScreen();
    expect(chatPage.type).toBe("View");
  });

  it("should render the prompt input", async () => {
    const input = await screen.findByTestId("prompt-input");
    expect(input).toBeOnTheScreen();
    expect(input.type).toBe("TextInput");
  });

  it("should render the send button", async () => {
    const input = await screen.findByTestId("prompt-input");
    fireEvent.changeText(input, "Hello");

    const sendButton = await screen.findByTestId("send-button");
    expect(sendButton).toBeOnTheScreen();
    expect(sendButton.type).toBe("View");
  });

  it("should create a new chat when the new chat button is pressed", async () => {
    const openDrawerButton = await screen.findByTestId("open-drawer-button");
    fireEvent.press(openDrawerButton);

    const newChatButton = await screen.findByTestId("new-chat-button");
    fireEvent.press(newChatButton);

    const chatButton = await screen.findByTestId("chat-button-0");
    expect(chatButton).toBeOnTheScreen();
  });

  it("should navigate to settings when the settings button is pressed", async () => {
    const settingsButton = await screen.findByTestId("settings-button");
    fireEvent.press(settingsButton);

    const settingsPage = await screen.findByTestId("settings-page");
    expect(settingsPage).toBeOnTheScreen();

    const backButton = await screen.findByTestId("back-button");
    fireEvent.press(backButton);

    expect(settingsPage).not.toBeOnTheScreen();

    const chatPage = await screen.findByTestId("chat-page");
    expect(chatPage).toBeOnTheScreen();
  });
});
