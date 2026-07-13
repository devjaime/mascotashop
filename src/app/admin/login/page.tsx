import Link from "next/link";
import { PawPrint } from "@phosphor-icons/react/dist/ssr";
import { login } from "../actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="admin-login"><form action={login} className="admin-login-card">
    <div className="admin-logo"><PawPrint weight="fill" /></div>
    <span className="eyebrow">MascotasShop</span><h1>Administración</h1><p>Ingresa para gestionar productos, disponibilidad y stock.</p>
    {error === "credentials" ? <div className="admin-error">Correo o contraseña incorrectos.</div> : null}
    {error === "config" ? <div className="admin-error">Supabase aún no está configurado.</div> : null}
    <label>Correo<input name="email" type="email" autoComplete="email" required /></label>
    <label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label>
    <button type="submit">Ingresar</button><Link href="/">← Volver a la tienda</Link>
  </form></main>;
}
