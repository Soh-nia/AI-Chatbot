import { toast as sonnerToast, type ToastT } from "sonner"

type ToastProps = Omit<ToastT, "id"> & {
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

export function useToast() {
    return {
        toast: ({ title, description, variant = "default", ...props }: ToastProps) => {
            return sonnerToast(title || "", {
                description,
                ...props,
                className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : undefined,
            })
        },
    }
}