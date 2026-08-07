'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── Types ── */
interface Project {
    id: number;
    nameAr: string;
    nameEn: string | null;
}

interface Apartment {
    id: number;
    unitCode: string | null;
    nameAr: string;
    nameEn: string | null;
    buildingName: string | null;
    apartmentNumber: number | null;
    floor: number | null;
    area: number | null;
    buildingArea: number | null;
    roofArea: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    maidBathroom: number | null;
    price: number | null;
    status: string;
    type: string | null;
    image: string | null;
    livingRoom: number | null;
    kitchen: number | null;
    driverRoom: number | null;
    maidRoom: number | null;
    balcony: number | null;
    parking: number | null;
    garden: number | null;
    entrance: number | null;
    majlis: number | null;
    storage: number | null;
    roof: number | null;
    laundry: number | null;
    direction: string | null;
    view: string | null;
}

/* ── Empty form state ── */
const emptyForm = (): Omit<Apartment, 'id'> => ({
    unitCode: '',
    nameAr: '',
    nameEn: '',
    buildingName: '',
    apartmentNumber: null,
    floor: null,
    area: null,
    buildingArea: null,
    roofArea: null,
    bedrooms: null,
    bathrooms: null,
    maidBathroom: null,
    price: null,
    status: 'available',
    type: 'شقة',
    image: '',
    livingRoom: 0,
    kitchen: 0,
    driverRoom: 0,
    maidRoom: 0,
    balcony: 0,
    parking: 0,
    garden: 0,
    entrance: 0,
    majlis: 0,
    storage: 0,
    roof: 0,
    laundry: 0,
    direction: '',
    view: '',
});

/* ── Status options ── */
const STATUS_OPTIONS = [
    { value: 'available', labelAr: 'متاح', labelEn: 'Available', color: '#059669' },
    { value: 'reserved', labelAr: 'محجوز', labelEn: 'Reserved', color: '#d97706' },
    { value: 'sold',     labelAr: 'مباع',  labelEn: 'Sold',     color: '#dc2626' },
];

/* ── Feature toggles ── */
const FEATURES = [
    { key: 'livingRoom',  labelAr: 'غرفة معيشة', labelEn: 'Living Room',   icon: '🛋️' },
    { key: 'kitchen',     labelAr: 'مطبخ',        labelEn: 'Kitchen',       icon: '🍳' },
    { key: 'driverRoom',  labelAr: 'غرفة سائق',   labelEn: 'Driver Room',   icon: '🚗' },
    { key: 'maidRoom',    labelAr: 'غرفة عاملة',  labelEn: 'Maid Room',     icon: '🧹' },
    { key: 'balcony',     labelAr: 'بلكونة',      labelEn: 'Balcony',       icon: '🏗️' },
    { key: 'parking',     labelAr: 'موقف سيارة',  labelEn: 'Parking',       icon: '🅿️' },
    { key: 'garden',      labelAr: 'حديقة',       labelEn: 'Garden',        icon: '🌿' },
    { key: 'entrance',    labelAr: 'مدخل خاص',    labelEn: 'Private Entrance', icon: '🚪' },
    { key: 'majlis',      labelAr: 'مجلس',         labelEn: 'Majlis',        icon: '🏠' },
    { key: 'storage',     labelAr: 'مستودع',      labelEn: 'Storage',       icon: '📦' },
    { key: 'roof',        labelAr: 'روف',          labelEn: 'Roof',          icon: '🏔️' },
    { key: 'laundry',     labelAr: 'غرفة غسيل',   labelEn: 'Laundry',       icon: '👕' },
] as const;

type FeatureKey = typeof FEATURES[number]['key'];

/* ════════════════════════════════════════════ */
export default function ApartmentsDetailPage() {
    const locale  = useLocale();
    const isRTL   = locale === 'ar';
    const params  = useParams();
    const router  = useRouter();
    const projectId = Number(params.id);

    /* State */
    const [project,    setProject]    = useState<Project | null>(null);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [editTarget, setEditTarget] = useState<Apartment | null>(null);
    const [form,       setForm]       = useState(emptyForm());
    const [saving,     setSaving]     = useState(false);
    const [saveError,  setSaveError]  = useState('');
    const [deleteId,   setDeleteId]   = useState<number | null>(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [filterBuilding, setFilterBuilding] = useState('');
    const [filterStatus,   setFilterStatus]   = useState('');
    const [searchUnit,     setSearchUnit]      = useState('');

    /* ── Load data ── */
   const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const [projRes, aptsRes] = await Promise.all([
            fetch(`/api/projects/${projectId}`, {
                credentials: 'include',
            }),
            fetch(`/api/apartments?projectId=${projectId}`),
        ]);

        if (projRes.status === 401) {
            router.push(`/${locale}/admin/login`);
            return;
        }

        if (!projRes.ok) {
            console.error('Failed to fetch project:', projRes.status);
            setLoading(false);
            return;
        }

        const projData = await projRes.json();
        const aptsData = await aptsRes.json();

        // /api/projects/[id] returns the project object directly
        setProject(projData);
        setApartments(aptsData.apartments || []);

    } catch (err) {
        console.error('loadData error:', err);
    }
    setLoading(false);
}, [projectId, router, locale]);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── Open create form ── */
    const openCreate = () => {
        setEditTarget(null);
        setForm(emptyForm());
        setSaveError('');
        setShowForm(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    /* ── Open edit form ── */
    const openEdit = (apt: Apartment) => {
        setEditTarget(apt);
        setForm({
            unitCode:       apt.unitCode       ?? '',
            nameAr:         apt.nameAr,
            nameEn:         apt.nameEn         ?? '',
            buildingName:   apt.buildingName   ?? '',
            apartmentNumber: apt.apartmentNumber ?? null,
            floor:          apt.floor          ?? null,
            area:           apt.area           ?? null,
            buildingArea:   apt.buildingArea   ?? null,
            roofArea:       apt.roofArea       ?? null,
            bedrooms:       apt.bedrooms       ?? null,
            bathrooms:      apt.bathrooms      ?? null,
            maidBathroom:   apt.maidBathroom   ?? null,
            price:          apt.price          ?? null,
            status:         apt.status,
            type:           apt.type           ?? 'شقة',
            image:          apt.image          ?? '',
            livingRoom:     apt.livingRoom     ?? 0,
            kitchen:        apt.kitchen        ?? 0,
            driverRoom:     apt.driverRoom     ?? 0,
            maidRoom:       apt.maidRoom       ?? 0,
            balcony:        apt.balcony        ?? 0,
            parking:        apt.parking        ?? 0,
            garden:         apt.garden         ?? 0,
            entrance:       apt.entrance       ?? 0,
            majlis:         apt.majlis         ?? 0,
            storage:        apt.storage        ?? 0,
            roof:           apt.roof           ?? 0,
            laundry:        apt.laundry        ?? 0,
            direction:      apt.direction      ?? '',
            view:           apt.view           ?? '',
        });
        setSaveError('');
        setShowForm(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    /* ── Field helpers ── */
    const setField = (key: string, value: unknown) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const numField = (key: string, raw: string) =>
        setField(key, raw === '' ? null : Number(raw));

    const toggleFeature = (key: FeatureKey) =>
        setForm(prev => ({ ...prev, [key]: prev[key] ? 0 : 1 }));

    /* ── Image upload ── */
    const handleImageUpload = async (file: File) => {
        setUploadingImg(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res  = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.url) setField('image', data.url);
        } catch {
            setSaveError(isRTL ? 'فشل رفع الصورة' : 'Image upload failed');
        }
        setUploadingImg(false);
    };

    /* ── Save (create / update) ── */
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nameAr.trim()) {
            setSaveError(isRTL ? 'الاسم العربي مطلوب' : 'Arabic name is required');
            return;
        }
        setSaving(true);
        setSaveError('');
        const payload = { ...form, projectId };

        try {
            const res = await fetch(
                editTarget ? `/api/apartments/${editTarget.id}` : '/api/apartments',
                {
                    method: editTarget ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setSaveError(data.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
            } else {
                setShowForm(false);
                loadData();
            }
        } catch {
            setSaveError(isRTL ? 'خطأ في الاتصال' : 'Network error');
        }
        setSaving(false);
    };

    /* ── Delete ── */
    const handleDelete = async (id: number) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
        setDeleteId(id);
        try {
            await fetch(`/api/apartments/${id}`, { method: 'DELETE' });
            setApartments(prev => prev.filter(a => a.id !== id));
        } catch {
            alert(isRTL ? 'فشل الحذف' : 'Delete failed');
        }
        setDeleteId(null);
    };

    /* ── Derived ── */
    const buildings = [...new Set(apartments.map(a => a.buildingName).filter(Boolean))] as string[];

    const filtered = apartments.filter(a => {
        const matchBuilding = !filterBuilding || a.buildingName === filterBuilding;
        const matchStatus   = !filterStatus   || a.status === filterStatus;
        const matchSearch   = !searchUnit     ||
            (a.unitCode   || '').toLowerCase().includes(searchUnit.toLowerCase()) ||
            (a.nameAr     || '').includes(searchUnit) ||
            (a.nameEn     || '').toLowerCase().includes(searchUnit.toLowerCase());
        return matchBuilding && matchStatus && matchSearch;
    });

    /* status badge */
    const statusBadge = (s: string) => {
        const opt = STATUS_OPTIONS.find(o => o.value === s);
        return (
            <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                background: opt ? opt.color + '1a' : '#f3f4f6',
                color: opt ? opt.color : '#374151',
                border: `1px solid ${opt ? opt.color + '40' : '#e5e7eb'}`,
            }}>
                {opt ? (isRTL ? opt.labelAr : opt.labelEn) : s}
            </span>
        );
    };

    /* ════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════ */
    return (
    <>
        {/* ── Breadcrumb ── */}
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '20px', fontSize: '13px', color: '#6b7280'
        }}>
            <Link href={`/${locale}/admin/apartments`}
                style={{ color: '#6b7280', textDecoration: 'none' }}>
                {isRTL ? 'الشقق' : 'Apartments'}
            </Link>
            <span>/</span>
            <span style={{ color: '#1f2937', fontWeight: 600 }}>
                {project
                    ? (isRTL ? project.nameAr : (project.nameEn || project.nameAr))
                    : '...'}
            </span>
        </div>

        {/* ── Page Header ── */}
        <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px',
            flexWrap: 'wrap', gap: '12px'
        }}>
            <div>
                <h1 className="admin-page-title" style={{ marginBottom: '4px' }}>
                    {project
                        ? (isRTL ? project.nameAr : (project.nameEn || project.nameAr))
                        : '...'}
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {apartments.length} {isRTL ? 'وحدة مسجلة' : 'units registered'}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => router.back()}
                    className="admin-btn"
                    style={{ background: '#f3f4f6', color: '#374151' }}
                >
                    {isRTL ? '← رجوع' : '← Back'}
                </button>
                <button onClick={openCreate} className="admin-btn admin-btn-primary">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isRTL ? 'إضافة وحدة' : 'Add Unit'}
                </button>
            </div>
        </div>

        {/* ════════ FORM ════════ */}
        {showForm && (
            <div className="admin-card" style={{ marginBottom: '28px', border: '2px solid #c9a227' }}>
                {/* Form Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '24px',
                    paddingBottom: '16px', borderBottom: '1px solid #f3f4f6'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                        {editTarget
                            ? (isRTL ? '✏️ تعديل وحدة' : '✏️ Edit Unit')
                            : (isRTL ? '➕ إضافة وحدة جديدة' : '➕ Add New Unit')}
                    </h2>
                    <button
                        onClick={() => setShowForm(false)}
                        style={{
                            background: 'none', border: 'none',
                            fontSize: '22px', cursor: 'pointer',
                            color: '#9ca3af', lineHeight: 1
                        }}
                    >×</button>
                </div>

                <form onSubmit={handleSave}>

                    {/* ─ 1: Identity ─ */}
                    <SectionTitle isRTL={isRTL} ar="🪪 هوية الوحدة" en="🪪 Unit Identity" />
                    <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                        <div className="admin-field">
                            <label>
                                {isRTL ? 'كود الوحدة' : 'Unit Code'}
                                <span className="optional"> (optional)</span>
                            </label>
                            <input
                                type="text"
                                value={form.unitCode ?? ''}
                                onChange={e => setField('unitCode', e.target.value || null)}
                                placeholder="e.g. A-101"
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'النوع' : 'Type'}</label>
                            <select
                                value={form.type ?? ''}
                                onChange={e => setField('type', e.target.value)}
                            >
                                <option value="شقة">{isRTL ? 'شقة' : 'Apartment'}</option>
                                <option value="فيلا">{isRTL ? 'فيلا' : 'Villa'}</option>
                                <option value="دوبلكس">{isRTL ? 'دوبلكس' : 'Duplex'}</option>
                                <option value="روف">{isRTL ? 'روف' : 'Roof'}</option>
                                <option value="مكتب">{isRTL ? 'مكتب' : 'Office'}</option>
                                <option value="محل">{isRTL ? 'محل تجاري' : 'Shop'}</option>
                                <option value="أخرى">{isRTL ? 'أخرى' : 'Other'}</option>
                            </select>
                        </div>
                        <div className="admin-field">
                            <label>
                                {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
                                <span style={{ color: '#dc2626' }}> *</span>
                            </label>
                            <input
                                type="text"
                                value={form.nameAr}
                                onChange={e => setField('nameAr', e.target.value)}
                                required
                                placeholder={isRTL ? 'مثال: شقة 101' : 'e.g. شقة 101'}
                                dir="rtl"
                            />
                        </div>
                        <div className="admin-field">
                            <label>
                                {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
                                <span className="optional"> (optional)</span>
                            </label>
                            <input
                                type="text"
                                value={form.nameEn ?? ''}
                                onChange={e => setField('nameEn', e.target.value || null)}
                                placeholder="e.g. Apartment 101"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* ─ 2: Status ─ */}
                    <SectionTitle isRTL={isRTL} ar="📌 الحالة" en="📌 Status" />
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setField('status', opt.value)}
                                style={{
                                    padding: '10px 28px',
                                    borderRadius: '8px',
                                    border: `2px solid ${form.status === opt.value ? opt.color : '#e5e7eb'}`,
                                    background: form.status === opt.value ? opt.color + '18' : '#fff',
                                    color: form.status === opt.value ? opt.color : '#6b7280',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {isRTL ? opt.labelAr : opt.labelEn}
                            </button>
                        ))}
                    </div>

                    {/* ─ 3: Location ─ */}
                    <SectionTitle isRTL={isRTL} ar="📍 الموقع داخل المشروع" en="📍 Location within Project" />
                    <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                        <div className="admin-field">
                            <label>{isRTL ? 'اسم المبنى' : 'Building Name'}</label>
                            <input
                                type="text"
                                value={form.buildingName ?? ''}
                                onChange={e => setField('buildingName', e.target.value || null)}
                                placeholder={isRTL ? 'مثال: مبنى A' : 'e.g. Building A'}
                                list="building-list"
                            />
                            <datalist id="building-list">
                                {buildings.map(b => <option key={b} value={b} />)}
                            </datalist>
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'رقم الشقة' : 'Apartment Number'}</label>
                            <input
                                type="number"
                                value={form.apartmentNumber ?? ''}
                                onChange={e => numField('apartmentNumber', e.target.value)}
                                placeholder="101"
                                min={0}
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'الطابق' : 'Floor'}</label>
                            <input
                                type="number"
                                value={form.floor ?? ''}
                                onChange={e => numField('floor', e.target.value)}
                                placeholder="1"
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'الاتجاه' : 'Direction'}</label>
                            <select
                                value={form.direction ?? ''}
                                onChange={e => setField('direction', e.target.value || null)}
                            >
                                <option value="">{isRTL ? '— اختر —' : '— Select —'}</option>
                                <option value="شمال">{isRTL ? 'شمال' : 'North'}</option>
                                <option value="جنوب">{isRTL ? 'جنوب' : 'South'}</option>
                                <option value="شرق">{isRTL ? 'شرق' : 'East'}</option>
                                <option value="غرب">{isRTL ? 'غرب' : 'West'}</option>
                                <option value="شمال شرق">{isRTL ? 'شمال شرق' : 'North East'}</option>
                                <option value="شمال غرب">{isRTL ? 'شمال غرب' : 'North West'}</option>
                                <option value="جنوب شرق">{isRTL ? 'جنوب شرق' : 'South East'}</option>
                                <option value="جنوب غرب">{isRTL ? 'جنوب غرب' : 'South West'}</option>
                            </select>
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'الإطلالة' : 'View'}</label>
                            <input
                                type="text"
                                value={form.view ?? ''}
                                onChange={e => setField('view', e.target.value || null)}
                                placeholder={isRTL ? 'مثال: إطلالة على الحديقة' : 'e.g. Garden view'}
                            />
                        </div>
                    </div>

                    {/* ─ 4: Dimensions ─ */}
                    <SectionTitle isRTL={isRTL} ar="📐 المساحات" en="📐 Dimensions" />
                    <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                        <div className="admin-field">
                            <label>{isRTL ? 'المساحة الكلية (م²)' : 'Total Area (m²)'}</label>
                            <input
                                type="number" step="0.01" min={0}
                                value={form.area ?? ''}
                                onChange={e => numField('area', e.target.value)}
                                placeholder="120.5"
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'مساحة البناء (م²)' : 'Building Area (m²)'}</label>
                            <input
                                type="number" step="0.01" min={0}
                                value={form.buildingArea ?? ''}
                                onChange={e => numField('buildingArea', e.target.value)}
                                placeholder="100"
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'مساحة الروف (م²)' : 'Roof Area (m²)'}</label>
                            <input
                                type="number" step="0.01" min={0}
                                value={form.roofArea ?? ''}
                                onChange={e => numField('roofArea', e.target.value)}
                                placeholder="50"
                            />
                        </div>
                    </div>

                    {/* ─ 5: Rooms ─ */}
                    <SectionTitle isRTL={isRTL} ar="🛏️ الغرف" en="🛏️ Rooms" />
                    <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                        <div className="admin-field">
                            <label>{isRTL ? 'غرف النوم' : 'Bedrooms'}</label>
                            <input
                                type="number" min={0}
                                value={form.bedrooms ?? ''}
                                onChange={e => numField('bedrooms', e.target.value)}
                                placeholder="3"
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'دورات المياه' : 'Bathrooms'}</label>
                            <input
                                type="number" min={0}
                                value={form.bathrooms ?? ''}
                                onChange={e => numField('bathrooms', e.target.value)}
                                placeholder="2"
                            />
                        </div>
                        <div className="admin-field">
                            <label>{isRTL ? 'دورة مياه عاملة' : 'Maid Bathroom'}</label>
                            <input
                                type="number" min={0}
                                value={form.maidBathroom ?? ''}
                                onChange={e => numField('maidBathroom', e.target.value)}
                                placeholder="1"
                            />
                        </div>
                    </div>

                    {/* ─ 6: Price ─ */}
                    <SectionTitle isRTL={isRTL} ar="💰 السعر" en="💰 Price" />
                    <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                        <div className="admin-field">
                            <label>{isRTL ? 'السعر (ريال سعودي)' : 'Price (SAR)'}</label>
                            <input
                                type="number" step="0.01" min={0}
                                value={form.price ?? ''}
                                onChange={e => numField('price', e.target.value)}
                                placeholder="500,000"
                            />
                        </div>
                    </div>

                    {/* ─ 7: Features ─ */}
                    <SectionTitle isRTL={isRTL} ar="✨ المميزات والمرافق" en="✨ Features & Amenities" />
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '10px',
                        marginBottom: '24px',
                    }}>
                        {FEATURES.map(feat => {
                            const active = !!form[feat.key as FeatureKey];
                            return (
                                <button
                                    key={feat.key}
                                    type="button"
                                    onClick={() => toggleFeature(feat.key)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '12px 8px',
                                        borderRadius: '10px',
                                        border: `2px solid ${active ? '#c9a227' : '#e5e7eb'}`,
                                        background: active ? '#c9a2271a' : '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontFamily: 'inherit',
                                        fontSize: '12px',
                                        fontWeight: active ? 700 : 400,
                                        color: active ? '#92720b' : '#6b7280',
                                    }}
                                >
                                    <span style={{ fontSize: '22px' }}>{feat.icon}</span>
                                    {isRTL ? feat.labelAr : feat.labelEn}
                                </button>
                            );
                        })}
                    </div>

                    {/* ─ 8: Image ─ */}
                    <SectionTitle isRTL={isRTL} ar="🖼️ صورة الوحدة" en="🖼️ Unit Image" />
                    <div style={{ marginBottom: '24px' }}>
                        {/* Preview */}
                        {form.image && (
                            <div style={{
                                marginBottom: '12px',
                                position: 'relative',
                                display: 'inline-block',
                            }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={form.image}
                                    alt=""
                                    style={{
                                        width: '180px', height: '120px',
                                        objectFit: 'cover', borderRadius: '8px',
                                        display: 'block', border: '2px solid #e5e7eb',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setField('image', '')}
                                    style={{
                                        position: 'absolute', top: '6px', right: '6px',
                                        background: 'rgba(220,38,38,0.85)',
                                        color: '#fff', border: 'none', borderRadius: '50%',
                                        width: '24px', height: '24px', cursor: 'pointer',
                                        fontSize: '14px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >×</button>
                            </div>
                        )}

                        {/* Upload slot */}
                        <div className="admin-upload-slot">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" style={{ color: '#9ca3af' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {uploadingImg
                                    ? (isRTL ? 'جاري الرفع...' : 'Uploading...')
                                    : (isRTL ? 'اختر صورة للرفع' : 'Choose image to upload')}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingImg}
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) handleImageUpload(f);
                                }}
                            />
                        </div>

                        {/* URL input */}
                        <div className="admin-field" style={{ marginTop: '10px' }}>
                            <label style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {isRTL ? 'أو أدخل رابط الصورة مباشرة' : 'Or paste image URL directly'}
                            </label>
                            <input
                                type="url"
                                value={form.image ?? ''}
                                onChange={e => setField('image', e.target.value || null)}
                                placeholder="https://..."
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* ─ Error message ─ */}
                    {saveError && (
                        <div style={{
                            background: '#fee2e2', color: '#dc2626',
                            padding: '12px 16px', borderRadius: '8px',
                            marginBottom: '16px', fontSize: '13px', fontWeight: 600,
                        }}>
                            ⚠️ {saveError}
                        </div>
                    )}

                    {/* ─ Actions ─ */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="admin-btn"
                            style={{ background: '#f3f4f6', color: '#374151' }}
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            disabled={saving}
                            style={{ minWidth: '130px' }}
                        >
                            {saving
                                ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                                : editTarget
                                    ? (isRTL ? '💾 حفظ التعديلات' : '💾 Save Changes')
                                    : (isRTL ? '➕ إضافة الوحدة' : '➕ Add Unit')}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* ════════ FILTERS ════════ */}
        {!loading && apartments.length > 0 && (
            <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Search input */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            style={{
                                position: 'absolute', top: '50%',
                                transform: 'translateY(-50%)',
                                left: '10px', color: '#9ca3af', pointerEvents: 'none',
                            }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={isRTL ? 'ابحث بالكود أو الاسم...' : 'Search by code or name...'}
                            value={searchUnit}
                            onChange={e => setSearchUnit(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: '32px', paddingRight: '12px',
                                height: '36px', border: '1px solid #e5e7eb',
                                borderRadius: '6px', fontSize: '13px',
                                outline: 'none', fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    {/* Building filter */}
                    {buildings.length > 0 && (
                        <select
                            value={filterBuilding}
                            onChange={e => setFilterBuilding(e.target.value)}
                            style={{
                                height: '36px', padding: '0 12px',
                                border: '1px solid #e5e7eb', borderRadius: '6px',
                                fontSize: '13px', outline: 'none',
                                background: '#fff', fontFamily: 'inherit', cursor: 'pointer',
                            }}
                        >
                            <option value="">{isRTL ? 'كل المباني' : 'All Buildings'}</option>
                            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    )}

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{
                            height: '36px', padding: '0 12px',
                            border: '1px solid #e5e7eb', borderRadius: '6px',
                            fontSize: '13px', outline: 'none',
                            background: '#fff', fontFamily: 'inherit', cursor: 'pointer',
                        }}
                    >
                        <option value="">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
                        {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>
                                {isRTL ? o.labelAr : o.labelEn}
                            </option>
                        ))}
                    </select>

                    {/* Clear filters */}
                    {(filterBuilding || filterStatus || searchUnit) && (
                        <button
                            onClick={() => {
                                setFilterBuilding('');
                                setFilterStatus('');
                                setSearchUnit('');
                            }}
                            style={{
                                height: '36px', padding: '0 14px',
                                border: '1px solid #fecaca', borderRadius: '6px',
                                background: '#fff', color: '#dc2626',
                                fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                        >
                            {isRTL ? '✕ مسح الفلاتر' : '✕ Clear'}
                        </button>
                    )}

                    <span style={{ fontSize: '12px', color: '#9ca3af', marginInlineStart: 'auto' }}>
                        {filtered.length} / {apartments.length} {isRTL ? 'وحدة' : 'units'}
                    </span>
                </div>
            </div>
        )}

        {/* ════════ TABLE ════════ */}
        {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
                <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
        ) : apartments.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                    {isRTL ? 'لا توجد وحدات بعد' : 'No units yet'}
                </p>
                <p style={{ fontSize: '13px' }}>
                    {isRTL ? 'اضغط على "إضافة وحدة" للبدء' : 'Click "Add Unit" to get started'}
                </p>
                <button
                    onClick={openCreate}
                    className="admin-btn admin-btn-primary"
                    style={{ marginTop: '16px' }}
                >
                    {isRTL ? '➕ إضافة وحدة' : '➕ Add Unit'}
                </button>
            </div>
        ) : (
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{isRTL ? 'الصورة' : 'Image'}</th>
                            <th>{isRTL ? 'الكود' : 'Code'}</th>
                            <th>{isRTL ? 'الاسم' : 'Name'}</th>
                            <th>{isRTL ? 'المبنى' : 'Building'}</th>
                            <th>{isRTL ? 'الطابق' : 'Floor'}</th>
                            <th>{isRTL ? 'المساحة' : 'Area'}</th>
                            <th>{isRTL ? 'الغرف' : 'Rooms'}</th>
                            <th>{isRTL ? 'السعر' : 'Price'}</th>
                            <th>{isRTL ? 'الحالة' : 'Status'}</th>
                            <th>{isRTL ? 'المميزات' : 'Features'}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(apt => {
                            const name = isRTL
                                ? apt.nameAr
                                : (apt.nameEn || apt.nameAr);
                            const featureCount = FEATURES.filter(
                                f => !!apt[f.key as FeatureKey]
                            ).length;

                            return (
                                <tr key={apt.id}>
                                    {/* Image */}
                                    <td>
                                        {apt.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                className="row-thumb"
                                                src={apt.image}
                                                alt=""
                                                onError={e => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '48px', height: '48px',
                                                background: '#f3f4f6', borderRadius: '8px',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '20px',
                                            }}>🏠</div>
                                        )}
                                    </td>

                                    {/* Code */}
                                    <td>
                                        <span style={{
                                            fontFamily: 'monospace', fontSize: '12px',
                                            background: '#f3f4f6', padding: '2px 8px',
                                            borderRadius: '4px', color: '#374151',
                                        }}>
                                            {apt.unitCode || '—'}
                                        </span>
                                    </td>

                                    {/* Name + Type */}
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#1f2937' }}>
                                            {name}
                                        </span>
                                        {apt.type && (
                                            <span style={{
                                                fontSize: '11px', color: '#9ca3af',
                                                display: 'block', fontWeight: 400,
                                            }}>
                                                {apt.type}
                                            </span>
                                        )}
                                    </td>

                                    {/* Building + Number */}
                                    <td style={{ color: '#6b7280', fontSize: '13px' }}>
                                        {apt.buildingName || '—'}
                                        {apt.apartmentNumber && (
                                            <span style={{
                                                fontSize: '11px', color: '#9ca3af', display: 'block',
                                            }}>
                                                #{apt.apartmentNumber}
                                            </span>
                                        )}
                                    </td>

                                    {/* Floor */}
                                    <td style={{ textAlign: 'center', color: '#374151' }}>
                                        {apt.floor ?? '—'}
                                    </td>

                                    {/* Area */}
                                    <td style={{ fontSize: '13px', color: '#374151' }}>
                                        {apt.area ? `${apt.area} م²` : '—'}
                                        {apt.buildingArea && (
                                            <span style={{
                                                fontSize: '11px', color: '#9ca3af', display: 'block',
                                            }}>
                                                {isRTL
                                                    ? `بناء: ${apt.buildingArea}`
                                                    : `Build: ${apt.buildingArea}`}
                                            </span>
                                        )}
                                    </td>

                                    {/* Rooms */}
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {apt.bedrooms != null && (
                                                <span style={{ fontSize: '12px', color: '#374151' }}
                                                    title={isRTL ? 'غرف نوم' : 'Bedrooms'}>
                                                    🛏️ {apt.bedrooms}
                                                </span>
                                            )}
                                            {apt.bathrooms != null && (
                                                <span style={{ fontSize: '12px', color: '#374151' }}
                                                    title={isRTL ? 'دورات مياه' : 'Bathrooms'}>
                                                    🚿 {apt.bathrooms}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td style={{ fontWeight: 600, color: '#059669', fontSize: '13px' }}>
                                        {apt.price
                                            ? apt.price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')
                                            + (isRTL ? ' ر.س' : ' SAR')
                                            : '—'}
                                    </td>

                                    {/* Status */}
                                    <td>{statusBadge(apt.status)}</td>

                                    {/* Features */}
                                    <td style={{ textAlign: 'center' }}>
                                        {featureCount > 0 ? (
                                            <span style={{
                                                background: '#fef3c7', color: '#92400e',
                                                padding: '2px 8px', borderRadius: '12px',
                                                fontSize: '11px', fontWeight: 600,
                                            }}>
                                                {featureCount} ✨
                                            </span>
                                        ) : '—'}
                                    </td>

                                    {/* Actions */}
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => openEdit(apt)}
                                                className="admin-btn-icon"
                                                title={isRTL ? 'تعديل' : 'Edit'}
                                            >
                                                <svg width="15" height="15" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(apt.id)}
                                                className="admin-btn-icon danger"
                                                title={isRTL ? 'حذف' : 'Delete'}
                                                disabled={deleteId === apt.id}
                                            >
                                                <svg width="15" height="15" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </>
);
}

/* ── Small helper component ── */
function SectionTitle({ isRTL, ar, en }: { isRTL: boolean; ar: string; en: string }) {
    return (
        <div style={{
            fontSize: '14px', fontWeight: 700, color: '#374151',
            marginBottom: '12px', paddingBottom: '8px',
            borderBottom: '2px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '6px'
        }}>
            {isRTL ? ar : en}
        </div>
    );
}