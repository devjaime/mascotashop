import { Trash } from "@phosphor-icons/react/dist/ssr";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAdminUser, deleteAdminUser, updateAdminPassword } from "../actions";

export default async function UsersPage() {
  const { user } = await requireAdminUser();
  const admin = createAdminClient();
  const [{ data: roles, error: rolesError }, { data: authData, error: authError }] = await Promise.all([
    admin.from("admin_users").select("user_id, created_at").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 100 }),
  ]);
  if (rolesError) throw new Error(rolesError.message);
  if (authError) throw new Error(authError.message);
  const emails = new Map((authData.users ?? []).map((item) => [item.id, item.email ?? ""]));
  const users = (roles ?? []).map((role) => ({ ...role, email: emails.get(role.user_id) ?? "Sin correo", current: role.user_id === user.id }));

  return <main className="admin-shell">
    <AdminNav active="users" />
    <section className="admin-content">
      <header><div><span className="eyebrow">Acceso</span><h1>Usuarios</h1><p>Crea administradores, cambia contraseñas o retira el acceso al panel.</p></div></header>
      <form action={createAdminUser} className="product-form settings-form user-create-form">
        <h2>Nuevo administrador</h2>
        <div className="form-grid">
          <label>Correo<input name="email" type="email" autoComplete="off" required /></label>
          <label>Contraseña<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
        </div>
        <div className="form-actions"><button>Crear usuario</button></div>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Correo</th><th>Alta</th><th>Contraseña</th><th></th></tr></thead>
          <tbody>{users.map((item) => <tr key={item.user_id}>
            <td><strong>{item.email}</strong>{item.current ? <small> Sesión actual</small> : null}</td>
            <td>{new Date(item.created_at).toLocaleDateString("es-CL")}</td>
            <td><form action={updateAdminPassword} className="stock-form"><input type="hidden" name="id" value={item.user_id} /><input name="password" type="password" minLength={8} placeholder="Nueva contraseña" autoComplete="new-password" required /><button>Guardar</button></form></td>
            <td>{item.current ? null : <form action={deleteAdminUser}><input type="hidden" name="id" value={item.user_id} /><button className="danger-action" aria-label={`Eliminar ${item.email}`}><Trash /></button></form>}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </main>;
}
