"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Power,
  Sparkles,
  X,
  MapPin,
} from "lucide-react";
import {
  createAdminUserAction,
  toggleAdminUserStatusAction,
  deleteAdminUserAction,
  updateAdminPasswordAction,
} from "@/backend/actions/adminUserActions";
import { AdminUserListItem } from "@/backend/types";

interface AdminUsersClientProps {
  initialUsers: AdminUserListItem[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [usersList, setUsersList] = useState<AdminUserListItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo admin
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState<"ADMIN" | "SUB_ADMIN">("ADMIN");
  const [barrio, setBarrio] = useState("Las Granjas");

  // Estados de acción
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Estados para Modal de Cambio de Contraseña (DEF-05)
  const [passwordTargetUser, setPasswordTargetUser] = useState<AdminUserListItem | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (newPasswordValue.length < 6) {
      showAlert("error", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await updateAdminPasswordAction({
        userId: passwordTargetUser.id,
        newPassword: newPasswordValue,
      });

      if (res.success) {
        showAlert("success", `Contraseña de "${passwordTargetUser.nombre}" actualizada exitosamente.`);
        setPasswordTargetUser(null);
        setNewPasswordValue("");
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err?.message || "Error al actualizar contraseña.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createAdminUserAction({
        nombre,
        email,
        password,
        rol,
        barrio,
      });

      if (res.success && res.data) {
        setUsersList([
          {
            id: res.data.id,
            nombre: res.data.nombre,
            email: res.data.email,
            rol: res.data.rol,
            barrio: barrio,
            direccionDefault: "Sede Neiva",
            activo: true,
            createdAt: new Date(),
          },
          ...usersList,
        ]);
        showAlert("success", res.message);
        setIsModalOpen(false);
        // Reset form
        setNombre("");
        setEmail("");
        setPassword("");
        setRol("ADMIN");
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err?.message || "Error al registrar administrador.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUserListItem) => {
    try {
      const res = await toggleAdminUserStatusAction(user.id, user.activo);
      if (res.success) {
        setUsersList(
          usersList.map((u) => (u.id === user.id ? { ...u, activo: !u.activo } : u))
        );
        showAlert("success", res.message);
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err?.message || "Error al actualizar estado.");
    }
  };

  const handleDelete = async (user: AdminUserListItem) => {
    if (user.nombre.toLowerCase() === "natalia") {
      showAlert("error", "No es posible eliminar a la administradora principal Natalia.");
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el acceso de ${user.nombre}?`)) {
      return;
    }

    try {
      const res = await deleteAdminUserAction(user.id);
      if (res.success) {
        setUsersList(usersList.filter((u) => u.id !== user.id));
        showAlert("success", res.message);
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err?.message || "Error al eliminar usuario.");
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdmins = usersList.filter((u) => u.rol.toUpperCase() === "ADMIN").length;
  const totalSubAdmins = usersList.filter((u) => u.rol.toUpperCase() === "SUB_ADMIN").length;

  return (
    <div className="space-y-8">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Administradores de Dulce Cosmetics
            </h1>
            <span className="bg-[#f4c2c2] text-[#734e4e] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {usersList.length} Registrados
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los accesos de Natalia y del equipo administrativo para la tienda y pedidos de Neiva.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#7b5455] hover:bg-[#634243] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#7b5455]/20 hover:shadow-xl transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      {/* Alerta de notificación */}
      {alert && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#7b5455]/10 text-[#7b5455] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Administradores (ADMIN)
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalAdmins}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f1ca50]/20 text-[#735c00] flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Sub-Administradores
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalSubAdmins}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Cuentas Activas
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {usersList.filter((u) => u.activo).length}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar administrador por nombre o correo electrónico..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tabla y Tarjetas de Administradores */}
      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        {/* Vista Móvil: Tarjetas individuales (< md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs px-4">
              No se encontraron administradores con ese criterio.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isAdmin = user.rol.toUpperCase() === "ADMIN";
              const isNatalia = user.nombre.toLowerCase() === "natalia";

              return (
                <div key={user.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                          isNatalia
                            ? "bg-[#7b5455] text-[#f1ca50] ring-2 ring-[#f4c2c2]"
                            : isAdmin
                            ? "bg-[#7b5455] text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {user.nombre.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                          <span>{user.nombre}</span>
                          {isNatalia && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-[#7b5455] text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                              <Sparkles className="w-2.5 h-2.5 text-[#f1ca50]" />
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-gray-500 text-xs mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordTargetUser(user);
                          setNewPasswordValue("");
                        }}
                        className="p-2 text-gray-400 hover:text-[#7b5455] hover:bg-[#FAF9F6] rounded-xl border border-gray-100 transition-colors"
                        title="Cambiar contraseña"
                        aria-label={`Cambiar contraseña de ${user.nombre}`}
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      {!isNatalia ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 transition-colors"
                          title="Eliminar administrador"
                          aria-label={`Eliminar a ${user.nombre}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic px-1">Protegido</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isAdmin
                            ? "bg-[#7b5455]/10 text-[#7b5455] border border-[#7b5455]/20"
                            : "bg-[#735c00]/10 text-[#735c00] border border-[#735c00]/20"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {isAdmin ? "Admin Total" : "Sub-Admin"}
                      </span>
                      <span className="text-gray-500 text-[11px] flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#7b5455]" />
                        {user.barrio || "Las Granjas"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        user.activo
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.activo ? "bg-emerald-600 animate-pulse" : "bg-gray-400"
                        }`}
                      />
                      {user.activo ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista Desktop: Tabla completa (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider border-b border-gray-200/80 font-bold">
              <tr>
                <th className="py-3.5 px-6">Administrador</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Sede / Barrio</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    No se encontraron administradores con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.rol.toUpperCase() === "ADMIN";
                  const isNatalia = user.nombre.toLowerCase() === "natalia";

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Nombre y Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                              isNatalia
                                ? "bg-[#7b5455] text-[#f1ca50] ring-2 ring-[#f4c2c2]"
                                : isAdmin
                                ? "bg-[#7b5455] text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {user.nombre.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                              <span>{user.nombre}</span>
                              {isNatalia && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#7b5455] text-white font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                  <Sparkles className="w-2.5 h-2.5 text-[#f1ca50]" />
                                  Principal
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              Registrado el {new Date(user.createdAt).toLocaleDateString("es-CO")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="py-4 px-4 font-mono text-gray-700">{user.email}</td>

                      {/* Rol */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-[#7b5455]/10 text-[#7b5455] border border-[#7b5455]/20"
                              : "bg-[#735c00]/10 text-[#735c00] border border-[#735c00]/20"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {isAdmin ? "Admin Total" : "Sub-Admin"}
                        </span>
                      </td>

                      {/* Barrio */}
                      <td className="py-4 px-4 text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#7b5455]" />
                          {user.barrio || "Las Granjas, Neiva"}
                        </span>
                      </td>

                      {/* Estado Activo */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            user.activo
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title="Click para alternar estado activo/inactivo"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.activo ? "bg-emerald-600 animate-pulse" : "bg-gray-400"
                            }`}
                          />
                          {user.activo ? "Activo" : "Inactivo"}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordTargetUser(user);
                              setNewPasswordValue("");
                            }}
                            className="p-1.5 text-gray-400 hover:text-[#7b5455] hover:bg-[#FAF9F6] rounded-lg transition-colors"
                            title="Cambiar contraseña"
                            aria-label={`Cambiar contraseña de ${user.nombre}`}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          {!isNatalia ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar administrador"
                              aria-label={`Eliminar a ${user.nombre}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic px-1">Protegido</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Administrador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#ebdcdc] relative space-y-6">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#7b5455] text-white flex items-center justify-center shadow-md shadow-[#7b5455]/20">
                  <UserPlus className="w-4 h-4 text-[#f1ca50]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    Nuevo Administrador
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Dulce Cosmetics • Panel de Neiva
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso del Correo de Bienvenida */}
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#d4c2c2]/50 flex items-start gap-2.5 text-xs text-gray-600">
              <Sparkles className="w-4 h-4 text-[#f1ca50] shrink-0 mt-0.5" />
              <span>
                Al guardar, se enviará de forma automática el correo con el diseño oficial de{" "}
                <strong>Bienvenida a Dulce Cosmetics</strong> al destinatario.
              </span>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@dulcecosmetics.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Rol Asignado *
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455]"
                  >
                    <option value="ADMIN">ADMIN (Acceso Total)</option>
                    <option value="SUB_ADMIN">SUB_ADMIN (Despachos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Barrio / Sede
                  </label>
                  <input
                    type="text"
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    placeholder="Las Granjas, Neiva"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455]"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#7b5455] hover:bg-[#634243] text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-[#7b5455]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Guardar y Notificar ✨</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Contraseña (DEF-05) */}
      {passwordTargetUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setPasswordTargetUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 bg-[#FAF9F6] text-[#7b5455] rounded-xl border border-[#ebdcdc]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 id="password-modal-title" className="font-serif text-lg font-bold text-gray-900">
                  Actualizar Contraseña
                </h3>
                <p className="text-xs text-gray-500">
                  Para el administrador: <strong>{passwordTargetUser.nombre}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Mínimo 6 caracteres seguros"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7b5455] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showNewPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordTargetUser(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-3 px-4 bg-[#7b5455] hover:bg-[#634243] text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-[#7b5455]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Actualizar Contraseña</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
