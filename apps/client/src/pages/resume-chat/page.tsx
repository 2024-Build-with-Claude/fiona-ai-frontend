/* eslint-disable lingui/no-unlocalized-strings */
import "./page.css";

import { FileTextOutlined, RightOutlined } from "@ant-design/icons";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Button, Popover } from "antd";
import { CheckList } from "antd-mobile";
import { CheckListValue } from "antd-mobile/es/components/check-list";
import { FC, KeyboardEventHandler, useEffect, useRef, useState } from "react";

import { useResumeStore } from "@/client/stores/resume";

import { BuilderPage } from "../builder/page";
import { useChat } from "./hooks/use-chat";

const BUTTON_TEXTS = [
  // "build resume",
  // "review resume",
  // "apply internship",
  // "write cover letter",
  // "apply job",
];

export const ResumeChat: FC = () => {
  const [chatModePopoverOpen, setChatModePopoverOpen] = useState(false);
  const [checkListValue, setCheckListValue] = useState<CheckListValue[]>(["chat"]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, handleSendMessage, loading } = useChat();
  const resume = useResumeStore((state) => state.resume);

  const addUserMessage = async (message: string) => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    await handleSendMessage({ message, resumeId: resume.id });
  };

  const updateChat: KeyboardEventHandler<HTMLTextAreaElement> = async (event) => {
    const eventTarget = event.target as HTMLTextAreaElement;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (eventTarget.value.trim() && !loading) {
        await addUserMessage(eventTarget.value.trim());
      }
    }
  };

  const handleButtonClick = async (text: string) => {
    await addUserMessage(text);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const content = (
    <CheckList
      multiple={false}
      defaultValue={checkListValue}
      value={checkListValue}
      onChange={(e) => {
        if (e.length === 0) return;
        setCheckListValue(e);
        useResumeStore.setState({ chatBotState: e[0] as "chat" | "resume-preview" });
      }}
    >
      <CheckList.Item value="chat">Chat</CheckList.Item>
      <CheckList.Item value="resume-preview">Resume</CheckList.Item>
    </CheckList>
  );

  return (
    <div className="relative">
      <div area-label="avatar" className="flex h-[12svh] flex-1 items-center bg-white ">
        <Popover
          content={content}
          trigger="click"
          placement="rightTop"
          open={chatModePopoverOpen}
          onOpenChange={(open) => {
            setChatModePopoverOpen(open);
          }}
        >
          <Button
            type="text"
            className="max-md:absolute max-md:inset-x-0 max-md:top-10 max-md:m-auto max-md:w-fit"
            style={{ color: "gray" }}
            onClick={() => {
              setChatModePopoverOpen(!chatModePopoverOpen);
            }}
          >
            switch <RightOutlined rotate={chatModePopoverOpen ? 90 : 0} />
          </Button>
        </Popover>
        <div className="my-2 ml-auto mr-8 size-12 self-center rounded-full bg-gray-400"></div>
      </div>

      {Object.keys(resume).length > 0 && checkListValue[0] === "resume-preview" && (
        <div className="iframe-container h-[88svh]">
          <BuilderPage />
        </div>
      )}
      {checkListValue[0] === "chat" && (
        <div className="flex h-[88svh] flex-1 flex-col justify-between bg-white md:p-2">
          <div id="messages" className="flex flex-col overflow-y-auto p-3 md:pt-32">
            {messages.length === 0 ? (
              <>
                <img
                  src="/logo/fiona_ai_logo.jpg"
                  width={200}
                  height={200}
                  alt="official_logo"
                  className="m-auto"
                />
                <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-center md:space-x-4 md:space-y-0">
                  {BUTTON_TEXTS.map((text, index) => (
                    <Button
                      key={index}
                      icon={<FileTextOutlined />}
                      className="rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 md:h-20 md:w-48 md:items-baseline"
                      onClick={() => handleButtonClick(text)}
                    >
                      {text}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              messages.map((message, key) => (
                <div
                  key={key}
                  className={`flex items-end ${message.from === "bot" ? "justify-start " : "justify-end"}`}
                >
                  <div
                    className={`mx-2 flex max-w-lg flex-col space-y-2 leading-tight ${message.from === "bot" ? "order-2 items-start" : "order-1 items-end"}`}
                  >
                    <div>
                      <span
                        dangerouslySetInnerHTML={{ __html: message.text }}
                        className={`inline-block whitespace-pre-wrap break-words rounded-xl px-4 py-3 break-anywhere ${message.from === "bot" ? "border-indigo-gray-200 rounded-bl-none border-2 bg-gray-100 text-gray-600" : "rounded-br-none bg-blue-500 text-white"}`}
                      ></span>
                    </div>
                  </div>
                  <img
                    src={
                      message.from === "bot"
                        ? "https://cdn.icon-icons.com/icons2/1371/PNG/512/robot02_90810.png"
                        : "https://i.pravatar.cc/100?img=7"
                    }
                    alt=""
                    className={`size-6 rounded-full ${message.from === "bot" ? "order-1" : "order-2"}`}
                  />
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-end justify-start">
                <div className="text-md order-2 mx-2 flex flex-col items-start space-y-2 leading-tight">
                  <div>
                    <img
                      src="https://support.signal.org/hc/article_attachments/360016877511/typing-animation-3x.gif"
                      alt="..."
                      className="ml-6 w-16"
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="mb-2 border-gray-200 bg-[#d4d4d4] p-4 sm:mb-0">
            <div className="relative flex h-12">
              <textarea
                ref={inputRef}
                placeholder="Say something..."
                autoComplete="off"
                autoFocus={true}
                className="w-full resize-none border-2 border-gray-200 bg-gray-100 py-2 pl-5 pr-16 text-gray-600 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:placeholder:text-gray-400"
                rows={1}
                onKeyDown={updateChat}
              ></textarea>
              <div className="inset-y-0 right-2 ml-2 items-center sm:flex">
                <button
                  type="button"
                  className="inline-flex size-6 h-full items-center justify-center transition duration-200 ease-in-out focus:outline-none md:size-8"
                  disabled={loading}
                  onClick={async () => {
                    if (inputRef.current?.value && !loading) {
                      const message = inputRef.current.value.trim();
                      inputRef.current.value = "";
                      await handleButtonClick(message);
                    }
                  }}
                >
                  <PaperPlaneTilt size={"100%"} color="black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
