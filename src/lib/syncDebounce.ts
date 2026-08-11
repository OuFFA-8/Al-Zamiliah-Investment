import { syncProjectFromSheet, type SyncSummary } from "./sheetSync";

/**
 * بدل ما كل طلب webhook يعمل مزامنة كاملة لوحده، الطلبات اللي بتوصل
 * "أثناء" ما مزامنة شغالة بالفعل لنفس المشروع بتشارك في نفس النتيجة،
 * بدل ما تبدأ مزامنة جديدة من الصفر لكل واحدة. ده بيحل مشكلة "7 تعديلات
 * منفصلة = 7 مزامنات كاملة ورا بعض".
 */

const inFlight = new Map<number, Promise<SyncSummary>>();
const rerunNeeded = new Set<number>();

export async function syncProjectDeduped(
  projectId: number,
): Promise<SyncSummary> {
  const existing = inFlight.get(projectId);
  if (existing) {
    // فيه مزامنة شغالة بالفعل - سجّل إن فيه تعديل جديد وصل أثناءها،
    // وشارك في نتيجتها بدل ما تبدأ وحدة تانية
    rerunNeeded.add(projectId);
    return existing;
  }

  const promise = (async () => {
    try {
      return await syncProjectFromSheet(projectId);
    } finally {
      inFlight.delete(projectId);
      if (rerunNeeded.has(projectId)) {
        rerunNeeded.delete(projectId);
        // وصلت تعديلات إحنا شغالين - اعمل مزامنة تانية عشان تلحقها
        syncProjectDeduped(projectId).catch((err) => {
          console.error(`فشلت المزامنة التالية للمشروع ${projectId}:`, err);
        });
      }
    }
  })();

  inFlight.set(projectId, promise);
  return promise;
}