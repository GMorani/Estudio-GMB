import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  name: string
  email: string
  image?: string
}

export function UserAvatar({ name, email, image }: UserAvatarProps) {
  // Obtener las iniciales del nombre
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <Avatar>
      <AvatarImage src={image || "/placeholder.svg"} alt={name} />
      <AvatarFallback>{initials || <User className="h-4 w-4" />}</AvatarFallback>
    </Avatar>
  )
}
