import {
  Component,
  ChangeDetectorRef,
  OnInit,
  Renderer2,
  ElementRef,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser, CommonModule, DOCUMENT } from '@angular/common'; // استورد isPlatformBrowser و DOCUMENT
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from '@angular/animations';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { TranslatePipe } from '@ngx-translate/core';

interface BranchDetails {
  id: number;
  name: string;
  shortName: string;
  addressLines: string;
  phoneNumbers?: string;
  emails: string[];
  mapEmbedUrl: string;
  socialLinks?: SocialLink[];
  mainHeading?: string;
  subHeading?: string;
  hours?: string;
  MutualNumber: string;
  backgroundImageUrl: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-contact',
  imports: [CommonModule, SafeUrlPipe, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  animations: [
    trigger('detailsSequence', [
      // --- الانتقال عند الدخول (الظهور) ---
      transition(':enter', [
        // 1. إعدادات أولية للعناصر قبل بدء الأنيميشن
        // العنوان: مخفي وفوق
        query(
          '.details-title-anim',
          [
            // استخدمنا كلاس مميز للعنوان
            style({ opacity: 0, transform: 'translateY(-40px)' }),
          ],
          { optional: true },
        ), // optional: true لمنع الأخطاء إذا لم يوجد العنصر

        // الخريطة: مخفية وعلى اليمين
        query(
          '.map-container-anim',
          [
            // استخدمنا كلاس مميز للخريطة
            style({ opacity: 0, transform: 'translateX(50px)' }),
          ],
          { optional: true },
        ),

        // قسم التواصل: مخفي وعلى اليسار
        query(
          '.contact-details-anim',
          [
            // استخدمنا كلاس مميز للتواصل
            style({ opacity: 0, transform: 'translateX(-50px)' }),
          ],
          { optional: true },
        ),

        // 2. تشغيل الأنيميشن بالتسلسل
        // أ) تحريك العنوان للأسفل
        query(
          '.details-title-anim',
          [
            animate(
              '400ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' }),
            ),
          ],
          { optional: true },
        ),

        // ب) تحريك الخريطة من اليمين (تبدأ بعد 200ms من بدء العنوان)
        query(
          '.map-container-anim',
          [
            animate(
              '500ms 200ms ease-out',
              style({ opacity: 1, transform: 'translateX(0)' }),
            ), // 200ms delay
          ],
          { optional: true },
        ),

        // ج) تحريك قسم التواصل من اليسار (تبدأ بعد 400ms من بدء العنوان)
        query(
          '.contact-details-anim',
          [
            animate(
              '500ms 400ms ease-out',
              style({ opacity: 1, transform: 'translateX(0)' }),
            ), // 400ms delay
          ],
          { optional: true },
        ),
      ]),

      // --- الانتقال عند الخروج --- (يمكن عمل fade-out بسيط للحاوية كلها)
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class ContactComponent implements OnInit, OnDestroy {
  allBranchesData: BranchDetails[] = [
    {
      id: 1,
      name: 'branches.location1',
      shortName: 'branches.location1',
      addressLines: 'branches.addressLine1',
      phoneNumbers: '0114733303',
      MutualNumber: ' 920009756 ',
      hours: 'Sat-Thur 8:30am- 5pm',
      emails: ['zk@zk-legal.com'],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d4221.407487119673!2d46.719560481823365!3d24.69267349002198!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f038f92ad4285%3A0x2c70c9947f5734ac!2sZamil%20and%20Kharashi%20for%20Law%20Firm!5e0!3m2!1sen!2sus!4v1746333306077!5m2!1sen!2sus',
      socialLinks: [],
      backgroundImageUrl: '/images/الرياض.webp',
    },
    {
      id: 2,
      name: 'branches.location2',
      shortName: 'branches.location2',
      addressLines: 'branches.addressLine2',
      phoneNumbers: '0138147677',
      MutualNumber: ' 920009756',
      hours: 'Sat-Thur 8:30am- 5pm',
      emails: [' info@zk-legal.com'],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7151.15395905835!2d50.199194!3d26.340194!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e8b72d39626b%3A0xfac87c3508eeb3f6!2sNSH%20Tower%2C%206389%20King%20Fahd%20Road%2C%20Al%20Rakah%20Al%20Janubiyah%2C%20Al%20Khobar%2034227%2C%20Saudi%20Arabia!5e0!3m2!1sen!2sus!4v1746333187166!5m2!1sen!2sus',
      socialLinks: [],
      backgroundImageUrl: '/images/الخبر.webp',
    },
    {
      id: 3,
      name: 'branches.location3',
      shortName: 'branches.location3',
      addressLines: 'branches.addressLine3',
      MutualNumber: '920009756',
      hours: 'Sat-Thur 8:30am- 5pm',
      emails: ['jed@zk-legal.com'],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3709.5804973583886!2d39.108277199999996!3d21.6022921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3db561395220d%3A0x5522ee6036204b1f!2z2KfZhNiy2KfZhdmEINmI2KfZhNiu2LHYp9i02Yog2YTZhNmF2K3Yp9mF2KfYqSDZiNin2YTYp9iz2KrYtNin2LHYp9iqINin2YTZgtin2YbZiNmG2YrZhw!5e0!3m2!1sen!2seg!4v1780836094340!5m2!1sen!2seg',
      socialLinks: [],
      backgroundImageUrl: '/images/جدة.webp',
    },
  ];

  selectedBranch: BranchDetails | null = null;

  constructor(
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (this.allBranchesData && this.allBranchesData.length > 0) {
      setTimeout(() => {
        // نختار الفرع الأول ونعين الخلفية
        this.selectBranch(this.allBranchesData[0], true);
      }, 0); // تأخير بسيط جداً (0 ميلي ثانية) كافٍ لنقل التنفيذ إلى نهاية طابور المهام
    }
  }

  selectBranch(branch: BranchDetails, isInitialLoad: boolean = false): void {
    if (!isInitialLoad && this.selectedBranch?.id === branch.id) {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(
        this.document.body,
        'backgroundImage',
        `url('${branch.backgroundImageUrl}')`,
      );
    }
    this.selectedBranch = null;
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.selectedBranch = branch;
      this.cdRef.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    // هذا الكود سيتم تنفيذه عند مغادرة الصفحة
    // وسيقوم بإزالة الخلفية من الـ body
    if (isPlatformBrowser(this.platformId)) {
      // نضع قيمة فارغة لإزالة الـ inline style الخاص بالخلفية
      this.renderer.setStyle(this.document.body, 'backgroundImage', '');
    }
  }

  getRectangleClasses(branch: BranchDetails): string {
    const baseClasses =
      'relative w-full sm:w-auto bg-white rounded-lg shadow-md p-4  cursor-pointer transition-all duration-300 ease-in-out border-2 border-transparent ';
    const hoverClasses =
      'hover:shadow-lg hover:border-[#061933] hover:scale-[1.06]   ';
    if (this.selectedBranch?.id === branch.id) {
      return `${baseClasses} border-[#061933] ring-2 ring-[#061933] shadow-lg scale-[1.02]  `;
    } else {
      return `${baseClasses} ${hoverClasses} `;
    }
  }

  scrollToContent(event: MouseEvent): void {
    event.preventDefault();
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
      contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
