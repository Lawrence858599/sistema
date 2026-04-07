import { FlashMessage } from "@/components/flash-message";
import { updateUserRoleAction } from "@/features/admin/actions";
import { adminService } from "@/services/admin-service";
import { getSingleSearchParam } from "@/utils/request";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const data = await adminService.getDashboardData();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="stack-list">
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.success)} type="success" />
      <FlashMessage message={getSingleSearchParam(resolvedSearchParams.error)} type="error" />
      {data.users.map((user) => (
        <article className="panel user-card" key={user.id}>
          <div>
            <h2>{user.fullName}</h2>
            <p>{user.email}</p>
            <small>{user._count.orders} pedidos</small>
          </div>
          <form action={updateUserRoleAction} className="inline-form">
            <input name="userId" type="hidden" value={user.id} />
            <select defaultValue={user.role} name="role">
              <option value="CUSTOMER">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <button className="secondary-button" type="submit">
              Atualizar permissao
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}
