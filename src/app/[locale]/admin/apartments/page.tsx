'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

interface Project {
    id: number;
    nameAr: string;
    nameEn: string | null;
    type: string | null;
    image: string | null;
    buildingsCount: number | null;
    unitsCount: number | null;
    sortOrder: number;
    createdAt: string;
}

export default function ApartmentsPage() {
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/projects')
            .then(r => r.json())
            .then(d => {
                setProjects(d.projects || d || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = projects.filter(p => {
        const name = isRTL ? p.nameAr : (p.nameEn || p.nameAr);
        return name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <>
            {/* ── Header ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <div>
                    <h1 className="admin-page-title" style={{ marginBottom: '4px' }}>
                        {isRTL ? '🏢 إدارة الشقق والوحدات' : '🏢 Apartments & Units'}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        {isRTL
                            ? 'اختر مشروعاً لإدارة شققه ووحداته'
                            : 'Select a project to manage its apartments and units'}
                    </p>
                </div>
                <Link href={`/${locale}/admin/projects/new`} className="admin-btn admin-btn-primary">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isRTL ? 'مشروع جديد' : 'New Project'}
                </Link>
            </div>

            {/* ── Search ── */}
            <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <svg
                        width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        style={{
                            position: 'absolute',
                            top: '50%', transform: 'translateY(-50%)',
                            right: isRTL ? '12px' : 'auto',
                            left: isRTL ? 'auto' : '12px',
                            color: '#9ca3af',
                            pointerEvents: 'none',
                        }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={isRTL ? 'ابحث عن مشروع...' : 'Search project...'}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: isRTL ? '9px 36px 9px 14px' : '9px 14px 9px 36px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '13px',
                            outline: 'none',
                            fontFamily: 'inherit',
                            color: '#374151',
                        }}
                    />
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
                <div className="admin-stat-card">
                    <div className="label">{isRTL ? 'إجمالي المشاريع' : 'Total Projects'}</div>
                    <div className="value">{projects.length}</div>
                </div>
                <div className="admin-stat-card">
                    <div className="label">{isRTL ? 'إجمالي المباني' : 'Total Buildings'}</div>
                    <div className="value">
                        {projects.reduce((s, p) => s + (p.buildingsCount || 0), 0)}
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="label">{isRTL ? 'إجمالي الوحدات' : 'Total Units'}</div>
                    <div className="value">
                        {projects.reduce((s, p) => s + (p.unitsCount || 0), 0)}
                    </div>
                </div>
            </div>

            {/* ── Projects Grid ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
                    <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {isRTL ? 'لا توجد مشاريع' : 'No projects found'}
                    </p>
                    <p style={{ fontSize: '13px' }}>
                        {search
                            ? (isRTL ? 'جرب كلمة بحث مختلفة' : 'Try a different search term')
                            : (isRTL ? 'أضف مشروعاً جديداً للبدء' : 'Add a new project to get started')}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                    gap: '18px',
                }}>
                    {filtered.map(project => {
                        const name = isRTL
                            ? project.nameAr
                            : (project.nameEn || project.nameAr);

                        return (
                            <div
                                key={project.id}
                                className="admin-card"
                                style={{ padding: 0, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                            >
                                {/* Project Image */}
                                <div style={{
                                    position: 'relative',
                                    height: '160px',
                                    background: '#f3f4f6',
                                    overflow: 'hidden',
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={project.image || '/images/logo.png'}
                                        alt={name}
                                        style={{
                                            width: '100%', height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s',
                                        }}
                                        onError={e => {
                                            (e.target as HTMLImageElement).src = '/images/logo.png';
                                        }}
                                    />
                                    {/* Type Badge */}
                                    {project.type && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: isRTL ? '10px' : 'auto',
                                            left: isRTL ? 'auto' : '10px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: '#fff',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            backdropFilter: 'blur(4px)',
                                        }}>
                                            {project.type}
                                        </span>
                                    )}
                                    {/* Date Badge */}
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: isRTL ? '10px' : 'auto',
                                        right: isRTL ? 'auto' : '10px',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: '#ccc',
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(4px)',
                                    }}>
                                        {project.createdAt
                                            ? new Date(project.createdAt).toLocaleDateString(
                                                isRTL ? 'ar-SA' : 'en-US',
                                                { month: 'short', year: 'numeric' }
                                            )
                                            : '—'}
                                    </span>
                                </div>

                                {/* Project Info */}
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        color: '#1f2937',
                                        marginBottom: '12px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {name}
                                    </h3>

                                    {/* Mini Stats */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '8px',
                                        marginBottom: '14px',
                                    }}>
                                        <div style={{
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            textAlign: 'center',
                                            border: '1px solid #f3f4f6',
                                        }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                color: '#1f2937',
                                                lineHeight: 1,
                                            }}>
                                                {project.buildingsCount ?? '—'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                                {isRTL ? 'مبنى' : 'Buildings'}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            textAlign: 'center',
                                            border: '1px solid #f3f4f6',
                                        }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                color: '#1f2937',
                                                lineHeight: 1,
                                            }}>
                                                {project.unitsCount ?? '—'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                                {isRTL ? 'وحدة' : 'Units'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <Link
                                        href={`/${locale}/admin/apartments/${project.id}`}
                                        className="admin-btn admin-btn-primary"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {isRTL ? 'إدارة الشقق' : 'Manage Apartments'}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}