import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncProjectDeduped } from "@/lib/syncDebounce";
import { SheetValidationError } from "@/lib/sheetSync";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = body.secret;

    if (!secret || typeof secret !== "string") {
      return NextResponse.json(
        { error: "المفتاح السري مطلوب" },
        { status: 401 },
      );
    }

    // ندوّر على المشروع اللي مفتاحه يطابق المفتاح اللي جالنا
    const project = await prisma.project.findUnique({
      where: { sheetWebhookSecret: secret },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "المفتاح السري غير صحيح" },
        { status: 401 },
      );
    }

    // بنعمل المزامنة فورًا وبننتظرها لحد ما تخلص قبل ما نرد - مضمون
    // إنها هتتنفذ. لو فيه طلبات تانية بتوصل أثناء شغلها لنفس المشروع،
    // بتشارك في نفس النتيجة بدل ما تبدأ مزامنة جديدة من الصفر
    const summary = await syncProjectDeduped(project.id);

    return NextResponse.json({ received: true, summary });
  } catch (err: unknown) {
    if (err instanceof SheetValidationError) {
      console.warn("Webhook validation issues:", err.issues);
      return NextResponse.json(
        { error: err.message, validationIssues: err.issues },
        { status: 422 },
      );
    }
    console.error("Webhook error:", err);
    const message = err instanceof Error ? err.message : "خطأ غير معروف";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}