import { PostEditor } from "@/components/admin/PostEditor";

export const metadata = { title: "Nuevo cuento" };

export default function NewCuentoPage() {
  return <PostEditor type="cuento" />;
}
