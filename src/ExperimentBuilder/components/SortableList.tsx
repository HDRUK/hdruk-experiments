import { ReactNode } from "react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    sortableKeyboardCoordinates,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicator from "@mui/icons-material/DragIndicator";
import { IconButton } from "@mui/material";

interface SortableRenderProps {
    handle: ReactNode;
    dragging: boolean;
}

interface SortableRowProps {
    id: string;
    handleLabel: string;
    children: (props: SortableRenderProps) => ReactNode;
}

const SortableRow = ({ id, handleLabel, children }: SortableRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const handle = (
        <IconButton
            ref={setActivatorNodeRef}
            size="small"
            aria-label={handleLabel}
            {...attributes}
            {...listeners}>
            <DragIndicator fontSize="small" />
        </IconButton>
    );

    return (
        <li
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                transition,
            }}>
            {children({ handle, dragging: isDragging })}
        </li>
    );
};

export interface SortableListProps<T> {
    items: T[];
    getId: (item: T) => string;
    onMove: (from: number, to: number) => void;
    handleLabel: string;
    renderItem: (item: T, props: SortableRenderProps) => ReactNode;
}

const SortableList = <T,>({
    items,
    getId,
    onMove,
    handleLabel,
    renderItem,
}: SortableListProps<T>) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const ids = items.map(getId);

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }
        onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {items.map(item => (
                    <SortableRow
                        key={getId(item)}
                        id={getId(item)}
                        handleLabel={handleLabel}>
                        {props => renderItem(item, props)}
                    </SortableRow>
                ))}
            </SortableContext>
        </DndContext>
    );
};

export default SortableList;
