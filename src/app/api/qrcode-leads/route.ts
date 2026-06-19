import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_CONTACT_METHODS = ['PHONE', 'WHATSAPP', 'EMAIL'];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, contactMethod, projectIds } = body;

        // Validate required fields
        if (!name || !email || !phone || !contactMethod) {
            return NextResponse.json(
                { error: 'Name, email, phone, and contact method are required' },
                { status: 400 }
            );
        }

        if (!VALID_CONTACT_METHODS.includes(contactMethod)) {
            return NextResponse.json(
                { error: 'Invalid contact method' },
                { status: 400 }
            );
        }

        // projectIds is optional, but if provided must be an array of numbers
        const ids: number[] = Array.isArray(projectIds)
            ? projectIds.map((id: unknown) => parseInt(String(id))).filter((id: number) => !isNaN(id))
            : [];

        // Create the lead and its project links together in one transaction,
        // so we never end up with a lead that has no matching project rows
        // due to a partial failure.
        const lead = await prisma.$transaction(async (tx) => {
            const newLead = await tx.qrCodeLead.create({
                data: {
                    name,
                    email,
                    phone,
                    contactMethod,
                    status: 'new',
                },
            });

            if (ids.length > 0) {
                await tx.qrCodeLeadProject.createMany({
                    data: ids.map((projectId) => ({
                        leadId: newLead.id,
                        projectId,
                    })),
                });
            }

            return newLead;
        });

        return NextResponse.json({
            success: true,
            id: lead.id,
            message: 'Your request was submitted successfully',
        });
    } catch (error) {
        console.error('QR code lead submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit your request' },
            { status: 500 }
        );
    }
}