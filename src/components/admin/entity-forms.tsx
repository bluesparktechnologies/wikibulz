"use client";

import { useActionState } from "react";
import { deleteAuthorAction, deleteCategoryAction, saveAuthorAction, saveCategoryAction, saveCityAction, saveCountryAction, savePageAction, saveStateAction, saveTagAction, saveUserAction, type AdminActionState } from "@/app/admin/actions";
import type { Author, Category, City, Country, StateRegion } from "@/types/content";

const initialState: AdminActionState = { ok: false, message: "" };

function Message({ state }: { state: AdminActionState }) {
  return state.message ? <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p> : null;
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return <button disabled={pending} className="w-fit rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving..." : label}</button>;
}

export function CategoryForm({ category, categoryId, categories }: { category?: Category; categoryId?: string; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveCategoryAction, initialState);
  return <form action={action} onSubmit={(event) => { const input = event.currentTarget.elements.namedItem("categoryId"); if (input instanceof HTMLInputElement) input.value = categoryId ?? ""; }} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><input type="hidden" name="categoryId" defaultValue={categoryId ?? ""}/><div className="grid gap-4 md:grid-cols-2"><input name="name" defaultValue={category?.name} placeholder="Name" className="rounded border border-[var(--line)] px-3 py-2"/><div className="grid gap-1"><input name="slug" defaultValue={category?.slug} placeholder="Slug" className="rounded border border-[var(--line)] px-3 py-2"/>{category ? <p className="text-xs text-[var(--muted)]">Changing the slug updates category URLs and creates 301 redirects for old published URLs.</p> : null}</div></div><label className="grid gap-1 text-sm font-bold"><span>Parent category <span className="font-normal text-[var(--muted)]">(optional)</span></span><select name="parentCategory" defaultValue={category?.parentCategory ?? ""} className="rounded border border-[var(--line)] px-3 py-2 font-normal"><option value="">Top-level category</option>{categories.filter((item) => item.id !== categoryId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="text-xs font-normal text-[var(--muted)]">Choose a parent to create a nested category and URL hierarchy.</span></label><textarea name="description" defaultValue={category?.description} placeholder="Description" className="min-h-24 rounded border border-[var(--line)] px-3 py-2"/><div className="grid gap-4 md:grid-cols-3"><input name="seoTitle" defaultValue={category?.seoTitle} placeholder="SEO title" className="rounded border border-[var(--line)] px-3 py-2"/><input name="metaDescription" defaultValue={category?.metaDescription} placeholder="Meta description" className="rounded border border-[var(--line)] px-3 py-2"/><select name="indexStatus" defaultValue={category?.indexStatus ?? "index"} className="rounded border border-[var(--line)] px-3 py-2"><option value="index">index</option><option value="noindex">noindex</option></select></div><input name="canonicalUrl" defaultValue={category?.canonicalUrl} placeholder="Canonical URL" className="rounded border border-[var(--line)] px-3 py-2"/><Message state={state}/><Submit pending={pending} label={category ? "Update Category" : "Save Category"}/></form>;
}

export function CategoryDeleteForm({ categoryId, name }: { categoryId: string; name: string }) {
  return <form action={deleteCategoryAction} onSubmit={(event) => { if (!window.confirm(`Delete category "${name}"?`)) { event.preventDefault(); return; } const input = event.currentTarget.elements.namedItem("id"); if (input instanceof HTMLInputElement) input.value = categoryId; }}><input type="hidden" name="id" defaultValue={categoryId}/><button className="rounded border border-red-300 px-3 py-1 text-xs font-bold text-red-700">Delete</button></form>;
}


export function AuthorDeleteForm({ authorId, name }: { authorId: string; name: string }) {
  return <details className="relative"><summary className="cursor-pointer list-none rounded border border-red-300 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-50">Delete</summary><form action={deleteAuthorAction} className="mt-2 w-64 rounded-md border border-red-200 bg-white p-3 shadow-lg"><input type="hidden" name="id" value={authorId}/><p className="text-xs leading-5 text-[var(--muted)]">Delete author &quot;{name}&quot;? This is blocked if the author is linked to posts.</p><button className="mt-3 w-full rounded-md bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800">Confirm delete</button></form></details>;
}
export function TagForm() {
  const [state, action, pending] = useActionState(saveTagAction, initialState);
  return <form action={action} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><div className="grid gap-4 md:grid-cols-3"><input name="name" placeholder="Name" className="rounded border border-[var(--line)] px-3 py-2"/><input name="slug" placeholder="Slug" className="rounded border border-[var(--line)] px-3 py-2"/><select name="indexStatus" className="rounded border border-[var(--line)] px-3 py-2"><option value="noindex">noindex</option><option value="index">index</option></select></div><textarea name="description" placeholder="Description" className="min-h-20 rounded border border-[var(--line)] px-3 py-2"/><Message state={state}/><Submit pending={pending} label="Save Tag"/></form>;
}

export function AuthorForm({ author }: { author?: Author }) {
  const [state, action, pending] = useActionState(saveAuthorAction, initialState);
  return <form action={action} encType="multipart/form-data" className="grid gap-5 rounded-lg border border-[var(--line)] bg-white p-5">
    <input type="hidden" name="authorId" defaultValue={author?.id ?? ""}/>

    <section className="grid gap-3">
      <div>
        <h2 className="text-lg font-black">Author identity</h2>
        <p className="text-sm text-[var(--muted)]">Use the real public name that should appear on articles and author pages.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_160px]">
        <label className="grid gap-1 text-sm font-bold">Name<input name="name" required defaultValue={author?.name} placeholder="Author name" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Slug<input name="slug" defaultValue={author?.slug} placeholder="auto from name" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Email<input name="email" type="email" required defaultValue={author?.email} placeholder="name@example.com" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Status<select name="status" defaultValue={author?.status ?? "active"} className="rounded border border-[var(--line)] px-3 py-2 font-normal"><option value="active">active</option><option value="inactive">inactive</option></select></label>
      </div>
    </section>

    <section className="grid gap-3 rounded-lg border border-[#d8e6df] bg-[#f7fbf8] p-4">
      <div>
        <h2 className="text-lg font-black">Profile photo</h2>
        <p className="text-sm text-[var(--muted)]">Upload a clear headshot or paste an existing media URL. Alt text should describe the person or team.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <label className="grid gap-1 text-sm font-bold">Upload photo<input name="avatarFile" type="file" accept="image/*" className="rounded border border-[var(--line)] bg-white px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Photo URL<input name="avatarUrl" defaultValue={author?.avatar?.url} placeholder="/uploads/author.webp or https://..." className="rounded border border-[var(--line)] bg-white px-3 py-2 font-normal"/></label>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_120px_120px]">
        <label className="grid gap-1 text-sm font-bold">Photo alt text<input name="avatarAlt" defaultValue={author?.avatar?.alt} placeholder="Portrait of Author Name" className="rounded border border-[var(--line)] bg-white px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Width<input name="avatarWidth" type="number" min="1" defaultValue={author?.avatar?.width ?? 800} className="rounded border border-[var(--line)] bg-white px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Height<input name="avatarHeight" type="number" min="1" defaultValue={author?.avatar?.height ?? 800} className="rounded border border-[var(--line)] bg-white px-3 py-2 font-normal"/></label>
      </div>
    </section>

    <section className="grid gap-3">
      <div>
        <h2 className="text-lg font-black">Professional proof</h2>
        <p className="text-sm text-[var(--muted)]">Add only verified details. These are used on the author profile and Person schema.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold">Job title<input name="jobTitle" defaultValue={author?.jobTitle} placeholder="Local Business Research Editor" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Organization<input name="organization" defaultValue={author?.organization} placeholder="Wikibulz" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Location<input name="location" defaultValue={author?.location} placeholder="India" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
      </div>
      <label className="grid gap-1 text-sm font-bold">Bio<textarea name="bio" defaultValue={author?.bio} placeholder="Short public author bio with research focus and editorial experience." className="min-h-28 rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Expertise<input name="expertise" defaultValue={author?.expertise.join(", ")} placeholder="Local rankings, Healthcare services, Education services" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/><span className="text-xs font-normal text-[var(--muted)]">Comma separated topics the author can credibly cover.</span></label>
        <label className="grid gap-1 text-sm font-bold">Credentials<input name="credentials" defaultValue={author?.credentials.join(", ")} placeholder="Editor, Research analyst, Certified specialist" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/><span className="text-xs font-normal text-[var(--muted)]">Roles, certifications, memberships, or verified professional proof.</span></label>
        <label className="grid gap-1 text-sm font-bold">Education<input name="education" defaultValue={author?.education?.join(", ")} placeholder="Degree, institute, training" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Awards / recognition<input name="awards" defaultValue={author?.awards?.join(", ")} placeholder="Awards, recognitions, notable mentions" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
      </div>
    </section>

    <section className="grid gap-3">
      <div>
        <h2 className="text-lg font-black">Public links</h2>
        <p className="text-sm text-[var(--muted)]">Add profile URLs that verify the author. Leave blank when not available.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Website<input name="website" defaultValue={author?.website} placeholder="https://..." className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Social / proof links<input name="socialLinks" defaultValue={author?.socialLinks.join(", ")} placeholder="LinkedIn URL, X URL, portfolio URL" className="rounded border border-[var(--line)] px-3 py-2 font-normal"/></label>
      </div>
    </section>

    <Message state={state}/>
    <Submit pending={pending} label={author ? "Update Author" : "Save Author"}/>
  </form>;
}

export function PageForm() {
  const [state, action, pending] = useActionState(savePageAction, initialState);
  return <form action={action} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><div className="grid gap-4 md:grid-cols-2"><input name="title" placeholder="Title" className="rounded border border-[var(--line)] px-3 py-2"/><input name="slug" placeholder="Slug" className="rounded border border-[var(--line)] px-3 py-2"/></div><textarea name="excerpt" placeholder="Excerpt" className="min-h-20 rounded border border-[var(--line)] px-3 py-2"/><textarea name="content" placeholder="HTML content" className="min-h-44 rounded border border-[var(--line)] px-3 py-2 font-mono text-sm"/><div className="grid gap-4 md:grid-cols-3"><input name="seoTitle" placeholder="SEO title" className="rounded border border-[var(--line)] px-3 py-2"/><input name="metaDescription" placeholder="Meta description" className="rounded border border-[var(--line)] px-3 py-2"/><input name="canonicalUrl" placeholder="Canonical URL" className="rounded border border-[var(--line)] px-3 py-2"/></div><div className="flex gap-5 text-sm font-bold"><label><input type="checkbox" name="robotsIndex" defaultChecked/> Index</label><label><input type="checkbox" name="robotsFollow" defaultChecked/> Follow</label></div><Message state={state}/><Submit pending={pending} label="Save Page"/></form>;
}

export function UserForm() {
  const [state, action, pending] = useActionState(saveUserAction, initialState);
  return <form action={action} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><div className="grid gap-4 md:grid-cols-4"><input name="name" placeholder="Name" className="rounded border border-[var(--line)] px-3 py-2"/><input name="email" type="email" placeholder="Email" className="rounded border border-[var(--line)] px-3 py-2"/><input name="password" type="password" placeholder="New password" className="rounded border border-[var(--line)] px-3 py-2"/><select name="role" className="rounded border border-[var(--line)] px-3 py-2"><option value="author">author</option><option value="seo">seo</option><option value="editor">editor</option><option value="admin">admin</option></select></div><label className="text-sm font-bold"><input type="checkbox" name="active" defaultChecked/> Active</label><Message state={state}/><Submit pending={pending} label="Save User"/></form>;
}

function LocationFields({ item }: { item?: Country | StateRegion | City }) {
  return <>
    <div className="grid gap-4 md:grid-cols-2"><input name="name" defaultValue={item?.name} placeholder="Name" className="rounded border border-[var(--line)] px-3 py-2"/><input name="slug" defaultValue={item?.slug} placeholder="Slug" className="rounded border border-[var(--line)] px-3 py-2"/></div>
    <textarea name="description" defaultValue={item?.description} placeholder="Description" className="min-h-24 rounded border border-[var(--line)] px-3 py-2"/>
    <div className="grid gap-4 md:grid-cols-3"><input name="seoTitle" defaultValue={item?.seoTitle} placeholder="SEO title" className="rounded border border-[var(--line)] px-3 py-2"/><input name="metaDescription" defaultValue={item?.metaDescription} placeholder="Meta description" className="rounded border border-[var(--line)] px-3 py-2"/><input name="canonicalUrl" defaultValue={item?.canonicalUrl} placeholder="Canonical URL" className="rounded border border-[var(--line)] px-3 py-2"/></div>
    <div className="grid gap-4 md:grid-cols-2"><select name="indexStatus" defaultValue={item?.indexStatus ?? "index"} className="rounded border border-[var(--line)] px-3 py-2"><option value="index">index</option><option value="noindex">noindex</option></select><select name="status" defaultValue={item?.status ?? "active"} className="rounded border border-[var(--line)] px-3 py-2"><option value="active">active</option><option value="inactive">inactive</option></select></div>
  </>;
}

export function CountryForm({ country }: { country?: Country }) {
  const [state, action, pending] = useActionState(saveCountryAction, initialState);
  return <form action={action} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><input type="hidden" name="countryId" value={country?.id ?? ""}/><h2 className="text-xl font-black">{country ? "Edit Country" : "New Country"}</h2><LocationFields item={country}/><Message state={state}/><Submit pending={pending} label={country ? "Update Country" : "Save Country"}/></form>;
}

export function StateForm({ stateRegion, countries }: { stateRegion?: StateRegion; countries: Country[] }) {
  const [state, action, pending] = useActionState(saveStateAction, initialState);
  return <form action={action} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><input type="hidden" name="stateId" value={stateRegion?.id ?? ""}/><h2 className="text-xl font-black">{stateRegion ? "Edit State" : "New State"}</h2><select name="country" required defaultValue={stateRegion?.country.id ?? countries[0]?.id ?? ""} className="rounded border border-[var(--line)] px-3 py-2"><option value="" disabled>{countries.length ? "Select country" : "Create a country first"}</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select><LocationFields item={stateRegion}/><Message state={state}/><Submit pending={pending} label={stateRegion ? "Update State" : "Save State"}/></form>;
}

export function CityForm({ city, countries, states }: { city?: City; countries: Country[]; states: StateRegion[] }) {
  const [state, action, pending] = useActionState(saveCityAction, initialState);
  return <form action={action} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5"><input type="hidden" name="cityId" value={city?.id ?? ""}/><h2 className="text-xl font-black">{city ? "Edit City" : "New City"}</h2><div className="grid gap-4 md:grid-cols-2"><select name="country" required defaultValue={city?.country.id ?? countries[0]?.id ?? ""} className="rounded border border-[var(--line)] px-3 py-2"><option value="" disabled>{countries.length ? "Select country" : "Create a country first"}</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select><select name="state" required defaultValue={city?.state.id ?? states[0]?.id ?? ""} className="rounded border border-[var(--line)] px-3 py-2"><option value="" disabled>{states.length ? "Select state" : "Create a state first"}</option>{states.map((stateRegion) => <option key={stateRegion.id} value={stateRegion.id}>{stateRegion.name}</option>)}</select></div><LocationFields item={city}/><Message state={state}/><Submit pending={pending} label={city ? "Update City" : "Save City"}/></form>;
}
