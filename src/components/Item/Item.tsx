import update from "immutability-helper";
import React from "react";
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggableRubric,
} from "react-beautiful-dnd";
import { Item } from "../types";
import { c } from "../helpers";
import { Icon } from "../Icon/Icon";

export interface ItemContentProps {
  item: Item;
  isSettingsVisible: boolean;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export function ItemContent({
  item,
  isSettingsVisible,
  onChange,
  onKeyDown,
}: ItemContentProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>();

  React.useEffect(() => {
    if (isSettingsVisible) {
      inputRef.current?.focus();
    }
  }, [isSettingsVisible]);

  if (isSettingsVisible) {
    return (
      <div data-replicated-value={item.title} className={c("grow-wrap")}>
        <textarea
          rows={1}
          ref={inputRef}
          className={c("item-input")}
          value={item.title}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  }

  return <div className={c("item-title")}>{item.title}</div>;
}

export interface DraggableItemFactoryParams {
  items: Item[];
  laneIndex: number;
  shouldShowArchiveButton: boolean;
  deleteItem: (laneIndex: number, itemIndex: number) => void;
  updateItem: (laneIndex: number, itemIndex: number, item: Item) => void;
  archiveItem: (laneIndex: number, itemIndex: number, item: Item) => void;
}

export function draggableItemFactory({
  items,
  laneIndex,
  updateItem,
  deleteItem,
  archiveItem,
  shouldShowArchiveButton,
}: DraggableItemFactoryParams) {
  return (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric
  ) => {
    const itemIndex = rubric.source.index;
    const item = items[itemIndex];
    const [isSettingsVisible, setIsSettingsVisible] = React.useState(false);

    return (
      <div
        className={`${c("item")} ${snapshot.isDragging ? "is-dragging" : ""}`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <div className={c("item-content-wrapper")}>
          <ItemContent
            isSettingsVisible={isSettingsVisible}
            item={item}
            onChange={(e) =>
              updateItem(
                laneIndex,
                itemIndex,
                update(item, { title: { $set: e.target.value } })
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                setIsSettingsVisible(false);
              }
            }}
          />
          <div className={c("item-edit-button-wrapper")}>
            <button
              onClick={() => {
                setIsSettingsVisible(!isSettingsVisible);
              }}
              className={`${c("item-edit-button")} ${
                isSettingsVisible ? "is-enabled" : ""
              }`}
              aria-label={isSettingsVisible ? "Close" : "Edit item"}
            >
              <Icon name={isSettingsVisible ? "cross" : "pencil"} />
            </button>
            {shouldShowArchiveButton && (
              <button
                onClick={() => {
                  archiveItem(laneIndex, itemIndex, item);
                }}
                className={c("item-edit-archive-button")}
                aria-label="Archive item"
              >
                <Icon name="sheets-in-box" />
              </button>
            )}
          </div>
        </div>
        {isSettingsVisible && (
          <div className={c("item-settings")}>
            <div className={c("item-settings-actions")}>
              <button
                onClick={() => deleteItem(laneIndex, itemIndex)}
                className={c("item-button-delete")}
              >
                <Icon name="trash" /> Delete
              </button>
              <button
                onClick={() => archiveItem(laneIndex, itemIndex, item)}
                className={c("item-button-archive")}
              >
                <Icon name="sheets-in-box" /> Archive
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
}