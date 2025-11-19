"use client"

import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  RefreshCw,
  Square,
  Send,
  Loader2,
} from "lucide-react"

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react"

import type { FC } from "react"
import { LazyMotion, MotionConfig, domAnimation } from "motion/react"
import * as m from "motion/react-m"

import { Button } from "@/components/ui/button"
import { MarkdownText } from "@/components/assistant-ui/markdown-text"
import { ToolFallback } from "@/components/assistant-ui/tool-fallback"
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button"

import { cn } from "@/lib/utils"

export const Thread: FC = () => {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ThreadPrimitive.Root
          className="aui-root aui-thread-root"
          style={{
            ["--thread-max-width" as string]: "44rem",
          }}
        >
          <ThreadPrimitive.Viewport className="aui-thread-viewport">
            <ThreadPrimitive.If empty>
              <ThreadWelcome />
            </ThreadPrimitive.If>

            <ThreadPrimitive.Messages
              components={{
                UserMessage,
                EditComposer,
                AssistantMessage,
              }}
            />

            <ThreadPrimitive.If running>
              <LoadingIndicator />
            </ThreadPrimitive.If>

            <ThreadPrimitive.If empty={false}>
              <div className="aui-thread-viewport-spacer" />
            </ThreadPrimitive.If>

            <Composer />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </MotionConfig>
    </LazyMotion>
  )
}

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom"
      >
        <ArrowDown />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  )
}

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root">
      <div className="aui-thread-welcome-center">
        <div className="aui-thread-welcome-message">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="aui-thread-welcome-message-motion-1"
          >
            Hello there!
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="aui-thread-welcome-message-motion-2"
          >
            How can I help you today?
          </m.div>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  )
}

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions">
      {[
        {
          title: "What's the weather",
          label: "in San Francisco?",
          action: "What's the weather in San Francisco?",
        },
        {
          title: "Explain React hooks",
          label: "like useState and useEffect",
          action: "Explain React hooks like useState and useEffect",
        },
        {
          title: "Write a SQL query",
          label: "to find top customers",
          action: "Write a SQL query to find top customers",
        },
        {
          title: "Create a meal plan",
          label: "for a week",
          action: "Create a meal plan for a week",
        },
      ].map((suggestion, index) => (
        <ThreadPrimitive.Suggestion
          key={index}
          suggestion={suggestion.action}
          asChild
        >
          <m.button
            className="aui-thread-welcome-suggestion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <span className="aui-thread-welcome-suggestion-title">
              {suggestion.title}
            </span>
            <span className="aui-thread-welcome-suggestion-label">
              {suggestion.label}
            </span>
          </m.button>
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  )
}

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-message-user">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-start gap-3 justify-end"
      >
        <div className="aui-message-user-content">
          <MessagePrimitive.Content />
        </div>
      </m.div>
    </MessagePrimitive.Root>
  )
}

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root>
      <ComposerPrimitive.Input
        className="aui-composer-input"
        placeholder="Edit message..."
      />
      <ComposerPrimitive.Send asChild>
        <TooltipIconButton tooltip="Send" variant="default">
          <Check />
        </TooltipIconButton>
      </ComposerPrimitive.Send>
      <ComposerPrimitive.Cancel asChild>
        <TooltipIconButton tooltip="Cancel" variant="ghost">
          <Square />
        </TooltipIconButton>
      </ComposerPrimitive.Cancel>
    </ComposerPrimitive.Root>
  )
}

const LoadingIndicator: FC = () => {
  return (
    <div className="aui-message-assistant">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-start gap-3"
      >
        <div className="flex items-center gap-2 p-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </m.div>
    </div>
  )
}

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-message-assistant">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-start gap-3"
      >
        <div className="flex-1">
          <MessagePrimitive.Content
            className="aui-message-assistant-content"
            components={{
              Text: MarkdownText,
              tools: {
                Fallback: ToolFallback,
              },
            }}
          />
          <MessageError />
          <AssistantActionBar />
          <BranchPicker className="aui-branch-picker" />
        </div>
      </m.div>
    </MessagePrimitive.Root>
  )
}

const MessageError: FC = () => {
  return (
    <ErrorPrimitive.Root className="aui-message-error">
      <ErrorPrimitive.Message />
    </ErrorPrimitive.Root>
  )
}

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root className="aui-action-bar">
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy" variant="ghost">
          <Copy />
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" variant="ghost">
          <Pencil />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Reload" variant="ghost">
          <RefreshCw />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

const BranchPicker: FC<{ className?: string }> = ({ className }) => {
  return (
    <BranchPickerPrimitive.Root className={cn("aui-branch-picker-root", className)}>
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous" variant="ghost">
          <ChevronLeft />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <div className="aui-branch-picker-info">
        <BranchPickerPrimitive.Number />
        <span className="aui-branch-picker-info-separator">/</span>
        <BranchPickerPrimitive.Count />
      </div>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" variant="ghost">
          <ChevronRight />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}

const Composer: FC = () => {
  return (
    <div className="aui-composer-root">
      <ComposerPrimitive.Root>
        <ComposerPrimitive.Input
          className="aui-composer-input"
          placeholder="Type a message..."
        />
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton tooltip="Send" variant="default">
            <Send />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
      <ThreadScrollToBottom />
    </div>
  )
}

