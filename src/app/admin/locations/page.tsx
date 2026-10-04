import Link from "next/link";
import { CityForm, CountryForm, StateForm } from "@/components/admin/entity-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminCities, getAdminCountries, getAdminStates } from "@/repositories/admin.repository";

export default async function LocationsAdminPage({ searchParams }: { searchParams?: Promise<{ edit?: string; type?: string }> }) {
  await requireRole("editor");
  const [countries, states, cities] = await Promise.all([getAdminCountries(), getAdminStates(), getAdminCities()]);
  const query = await searchParams;
  const editingCountry = query?.type === "country" ? countries.find((item) => item.id === query.edit) : undefined;
  const editingState = query?.type === "state" ? states.find((item) => item.id === query.edit) : undefined;
  const editingCity = query?.type === "city" ? cities.find((item) => item.id === query.edit) : undefined;
  return <><h1 className="text-4xl font-black">Locations</h1><p className="mt-2 text-[var(--muted)]">Manage indexable country, state, and city hubs for local ranking architecture.</p>
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <CountryForm country={editingCountry}/>
      <StateForm stateRegion={editingState} countries={countries}/>
      <CityForm city={editingCity} countries={countries} states={states}/>
    </div>
    <section className="mt-8 overflow-x-auto rounded-lg border border-[var(--line)] bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr><th className="p-4">Type</th><th>Name</th><th>Slug</th><th>Parent</th><th>Index</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {countries.map((country) => <tr key={country.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">Country</td><td>{country.name}</td><td>{country.slug}</td><td>--</td><td>{country.indexStatus}</td><td>{country.status}</td><td><Link href={`/admin/locations?type=country&edit=${country.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-xs font-bold">Edit</Link></td></tr>)}
      {states.map((state) => <tr key={state.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">State</td><td>{state.name}</td><td>{state.slug}</td><td>{state.country.name}</td><td>{state.indexStatus}</td><td>{state.status}</td><td><Link href={`/admin/locations?type=state&edit=${state.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-xs font-bold">Edit</Link></td></tr>)}
      {cities.map((city) => <tr key={city.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">City</td><td>{city.name}</td><td>{city.slug}</td><td>{city.state.name}, {city.country.name}</td><td>{city.indexStatus}</td><td>{city.status}</td><td><Link href={`/admin/locations?type=city&edit=${city.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-xs font-bold">Edit</Link></td></tr>)}
    </tbody></table></section>
  </>;
}
