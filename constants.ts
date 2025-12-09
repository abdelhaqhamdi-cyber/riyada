import { ProjectTask, TaskStatus } from './types';

// The strategic execution order for batch processing.
// This ensures that foundational tasks are generated before dependent tasks.
export const EXECUTION_ORDER: string[] = [
  // Phase 1: Foundation & Core Architecture
  '63', // Final System Architecture (Sets the master plan)
  '1',  // Backend Architecture (Microservices)
  '10', // Database Schema (Detailed ERD)
  '64', // Database Implementation (SQL Code)
  '23', // CI/CD Pipeline (Infrastructure setup)

  // Phase 2: Backend Skeleton (Core Services)
  '2',  // Auth API
  '9',  // Ratings & Reviews System
  '14', // Advanced Search API
  '15', // Booking Feature Logic
  '16', // Payment Gateway Integration
  '18', // Ratings API Implementation
  '65', // Backend Development (Code Generation)

  // Phase 3: Frontend Skeleton & Core UI
  '4',  // UI/UX Design (Foundation for components)
  '11', // Mobile App Shell (Project Setup)
  '12', // UI Components Design
  '3',  // Internationalization (i18n)
  '5',  // Dark Mode Implementation
  '13', // Auth Integration (Frontend)
  '66', // Frontend Development (Code Generation)
  
  // Phase 4: Core Features & AI Integration
  '8',  // Health API Integration
  '19', // Challenges System Development
  '6',  // Recommendation Engine
  '7',  // AI Assistant (Concept)
  '20', // LLM Integration (Implementation)

  // Phase 5: E-commerce & Vendor Foundation
  '26', // Headless Commerce Architecture
  '33', // Structured Content (Data Models)
  '34', // Smart Calendar & Pricing
  '35', // Storefront Branding
  '36', // SHEO Engine
  
  // Phase 6: Advanced E-commerce & Logistics
  '27', // AI & AR Shopping Experience
  '28', // Smart Logistics 4.0
  '29', // AI Dynamic Pricing
  
  // Phase 7: Vendor Tools & Community Engagement
  '30', // Vendor Super-Dashboard
  '31', // Geo-Targeting Engine
  '32', // Sponsorship Hub
  
  // Phase 8: Data Analytics & Business Intelligence
  '37', // Time Series Analysis
  '38', // Market Basket Analysis
  '39', // Geospatial Analytics
  '40', // Benchmarking Engine
  '62', // Consumer Behavior Analysis

  // Phase 9: Hyper-Personalization & Gamification
  '41', // Dynamic Sport Profiles
  '42', // Precision AI Engine
  '43', // Segmented Leaderboards
  '44', // Advanced Gamification
  '45', // Personalized Dashboard
  
  // Phase 10: Smart Venue Management System (SVMS)
  '46', // Unified Resource Management
  '47', // AI Dynamic Pricing Engine (for Venues)
  '48', // Maintenance & Operations
  '49', // Recurring Contracts Manager
  '50', // Venue BI & Analytics
  '51', // Investment AI Advisor
  
  // Phase 11: Owner Personas & Hybrid Operations
  '52', // Owner Persona Engine
  '53', // Profit-Driven Dashboard
  '54', // Municipal Management System
  '55', // Hybrid Pricing & Subsidy Engine
  '56', // Smart Asset & Inventory
  '57', // Dual-Mode Reporting
  '58', // Lost Demand & Investment Analysis
  '59', // Hierarchical ACL System
  '60', // Flexible Data Architecture
  '61', // Mode Toggle UI
  
  // Phase 12: Admin & Monetization
  '21', // Admin Dashboard
  '22', // Revenue Split & Commissions

  // Phase 13: Finalization, Testing & Launch
  '17', // QA & Testing Strategy
  '67', // System Integration
  '24', // Deployment & Monitoring
  '25', // Launch Strategy
];


// Pre-populating with the user's specific requests
export const INITIAL_TASKS: ProjectTask[] = [
  {
    id: '1',
    title: 'تصميم البنية الخلفية (Microservices)',
    prompt: 'أنشئ بنية خلفية (Backend Architecture) تعتمد على Microservices باستخدام Python (Django Rest Framework) لاستضافة المنصة الرياضية. يجب أن تدعم البنية التوسع الأفقي (Horizontal Scaling) وأن تكون جاهزة للنشر على Kubernetes.\n\nالمطلوب:\n1. مخطط بياني للبنية (Architecture Diagram) يوضح الخدمات وتدفق البيانات.\n2. مخطط علاقات الكيانات (ERD) لقاعدة البيانات.\n3. كود النماذج (Models) الأساسية لـ: المستخدم (User)، المدرب (Provider)، والحجز (Booking).',
    goal: 'إنشاء أساس قوي وقابل للتوسع (Microservices) مدعوم بمخططات بصرية.',
    status: TaskStatus.COMPLETED,
    result: `# تصميم البنية الخلفية المفصل (Detailed Microservices Architecture)

هذه الوثيقة هي **إعادة تفصيل وتوسيع** للمواصفات الأولية للبنية الخلفية. تم إضافة تفاصيل حول نقاط النهاية (Endpoints)، أنماط الاتصال، ونماذج النشر على Kubernetes لتقديم رؤية تنفيذية كاملة.

### 1. مخطط البنية وتدفق البيانات (Architecture Diagram)

البنية الأساسية تظل كما هي، معتمدة على بوابة API لتوجيه الطلبات إلى الخدمات المصغرة المتخصصة.

\`\`\`mermaid
graph TD
    Client[Mobile/Web App] -->|HTTPS/REST API| Gateway[API Gateway / Nginx Ingress]
    
    subgraph Cluster [Kubernetes Cluster]
        Gateway -->|/api/auth/**| Auth[Auth Service]
        Gateway -->|/api/bookings/**| Booking[Booking Service]
        Gateway -->|/api/search/**| Search[Search Service]
        
        Auth --> DB_Auth[(User DB - PostgreSQL)]
        Booking --> DB_Booking[(Booking DB - PostgreSQL)]
        Search --> DB_Search[(Denormalized Search DB)]
        Search --> Redis[(Redis Cache)]
        
        Booking -->(event) Broker{RabbitMQ / Kafka}
        Broker -->(event) Notification[Notification Service]
        Broker -->(event) Analytics[Analytics Service]
    end
    
    style Gateway fill:#f9f,stroke:#333,stroke-width:2px
\`\`\`

---

### 2. تفصيل الخدمات ونقاط النهاية (Services & API Endpoints)

#### أ. خدمة المصادقة (Auth Service)
- **المسؤولية:** إدارة المستخدمين، التسجيل، تسجيل الدخول، إصدار وتجديد JWT Tokens.
- **قاعدة البيانات:** مستقلة، تحتوي على جدول المستخدمين مع بيانات الاعتماد المشفرة.
- **نقاط النهاية الرئيسية:**
  - \`POST /api/auth/register\`: تسجيل مستخدم جديد.
  - \`POST /api/auth/login\`: تسجيل الدخول وإرجاع \`access\` و \`refresh\` tokens.
  - \`POST /api/auth/token/refresh\`: تجديد صلاحية \`access token\` باستخدام \`refresh token\`.
  - \`GET /api/auth/me\`: الحصول على بيانات المستخدم الحالي (يتطلب توكن مصادق).

#### ب. خدمة الحجز (Booking Service)
- **المسؤولية:** إدارة بيانات المدربين والمرافق، إنشاء الحجوزات، التحقق من التوفر.
- **قاعدة البيانات:** تحتوي على جداول الحجوزات، المدربين، والتقييمات.
- **نقاط النهاية الرئيسية:**
  - \`GET /api/bookings/\`: الحصول على قائمة حجوزات المستخدم الحالي.
  - \`POST /api/bookings/\`: إنشاء حجز جديد.
  - \`GET /api/providers/{id}\`: عرض تفاصيل مدرب/مرفق معين.
  - \`POST /api/bookings/{id}/review\`: إضافة تقييم لحجز مكتمل.

#### ج. أنماط الاتصال (Communication Patterns)
- **الاتصال المتزامن (Synchronous):** يتم استخدام REST API (عبر بوابة API) للعمليات التي تتطلب استجابة فورية من المستخدم، مثل تسجيل الدخول أو إنشاء حجز.
- **الاتصال غير المتزامن (Asynchronous):** عند تأكيد حجز جديد، تقوم خدمة الحجز بنشر حدث (event) مثل \`booking_confirmed\` إلى وسيط الرسائل (Message Broker). الخدمات الأخرى مثل **خدمة الإشعارات** تستمع لهذه الأحداث لإرسال بريد إلكتروني أو إشعار فوري للمستخدم دون تعطيل الاستجابة الأولية.

---

### 3. مخطط قاعدة البيانات (Database Schema - ERD)

المخطط المفاهيمي للعلاقات يبقى كما هو، مع التأكيد على نمط **"قاعدة بيانات لكل خدمة"** في التنفيذ الفعلي لمنع التبعيات المباشرة بين الخدمات.

\`\`\`mermaid
erDiagram
    User ||--o{ Booking : makes
    User {
        int id PK
        string email
        string role "CLIENT, PROVIDER, ADMIN"
        string phone
        datetime date_joined
    }
    
    Provider ||--o{ Booking : receives
    Provider |o--|| User : extends
    Provider {
        int id PK
        int user_id FK
        text bio
        float rating
        geometry location
    }
    
    Booking {
        int id PK
        int client_id FK
        int provider_id FK
        datetime start_time
        datetime end_time
        string status "PENDING, CONFIRMED, CANCELLED"
        decimal price
    }
\`\`\`

---

### 4. تطبيق النماذج (Django Implementation)

الكود المبدئي لنماذج خدمة الحجز يظل كما هو لضمان الاتساق.

\`\`\`python
# filename: services/booking/models.py
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class User(models.Model):
    """
    نسخة مبسطة من المستخدم داخل خدمة الحجز.
    يتم مزامنة البيانات الأساسية فقط من خدمة المصادقة (Auth Service).
    """
    id = models.IntegerField(primary_key=True)
    email = models.EmailField()
    
    def __str__(self):
        return self.email

class ServiceProvider(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    bio = models.TextField(_("Bio"), blank=True)
    rating = models.DecimalField(_("Rating"), max_digits=3, decimal_places=2, default=5.0)
    # ملاحظة: في الإنتاج يفضل استخدام GeoDjango مع PostGIS
    latitude = models.FloatField(_("Latitude"))
    longitude = models.FloatField(_("Longitude"))

    class Meta:
        db_table = 'service_providers'

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        COMPLETED = 'COMPLETED', _('Completed')

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='received_bookings')
    
    start_time = models.DateTimeField(_("Start Time"))
    end_time = models.DateTimeField(_("End Time"))
    
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Booking {self.id} - {self.status}"
\`\`\`

---

### 5. النشر على Kubernetes (Deployment Example)

لتحقيق متطلب "جاهز للنشر على Kubernetes"، يجب أن يكون لكل خدمة ملفات \`Dockerfile\` و ملفات توصيف K8s. فيما يلي مثال لخدمة الحجز:

#### أ. ملف النشر (Deployment)
هذا الملف يخبر Kubernetes بكيفية تشغيل الحاويات (Pods) الخاصة بالخدمة.

\`\`\`yaml
# filename: k8s/booking-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: booking-service-deployment
spec:
  replicas: 3 # ابدأ بـ 3 نسخ، ويمكن لـ HPA زيادتها
  selector:
    matchLabels:
      app: booking-service
  template:
    metadata:
      labels:
        app: booking-service
    spec:
      containers:
      - name: booking-service
        image: your-registry/booking-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: booking-db-secret
              key: url
        readinessProbe: # فحص للتأكد من جاهزية التطبيق لاستقبال الطلبات
          httpGet:
            path: /healthz
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
\`\`\`

#### ب. ملف الخدمة (Service)
هذا الملف يوفر عنوان شبكة داخلي ثابت للوصول إلى حاويات الخدمة.

\`\`\`yaml
# filename: k8s/booking-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: booking-service-svc
spec:
  selector:
    app: booking-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP # يمكن الوصول إليه فقط داخل الكلاستر
\`\`\`

ستقوم بوابة الدخول (Ingress Controller) بتوجيه الطلبات من \`your-domain.com/api/bookings\` إلى \`booking-service-svc\`.`,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'تصميم نظام المصادقة (Auth API)',
    prompt: 'صمم واجهة برمجة تطبيقات RESTful API للتعامل مع المصادقة (Authentication). يجب أن تتضمن نقاط النهاية (Endpoints) لـ: التسجيل (Register) عبر البريد/الهاتف، تسجيل الدخول (Login) باستخدام JWT Token، وتحديث كلمة المرور. يجب أن يتم تشفير جميع كلمات المرور باستخدام bcrypt.',
    goal: 'ضمان أمان المصادقة والالتزام بالمعايير القياسية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 1000,
  },
  {
    id: '3',
    title: 'تطبيق التدويل (i18n)',
    prompt: 'طبق معيار التدويل (Internationalization - i18n) على الواجهة الأمامية (باستخدام React أو Flutter). يجب أن يدعم التطبيق اللغة العربية والإنجليزية كلغات أساسية، مع فصل جميع النصوص في ملفات ترجمة (JSON/YAML) منفصلة لسهولة إضافة لغات مستقبلية.',
    goal: 'دعم اللغات المتعددة بشكل قياسي.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 2000,
  },
  {
    id: '4',
    title: 'تصميم واجهة المستخدم (UI/UX)',
    prompt: 'صمم واجهة المستخدم (UI) للتطبيق مع التركيز على سهولة الاستخدام والمألوفية، بحيث تحاكي تصاميم تطبيقات التواصل الاجتماعي (مثل شريط التنقل السفلي، خلاصات الأخبار المتدفقة، ملفات التعريف المتمحورة حول الصورة). يجب أن تكون متجاوبة (Responsive) لدعم شاشات الهاتف والويب.',
    goal: 'ضمان سهولة التبني من قبل المستخدمين الجدد.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 3000,
  },
  {
    id: '5',
    title: 'تنفيذ الوضع المظلم (Dark Mode)',
    prompt: 'نفذ وظيفة التبديل بين الوضع الفاتح (Light Mode) والوضع المظلم (Dark Mode) في الواجهة الأمامية. يجب أن يتم حفظ خيار المستخدم في إعدادات التطبيق أو تخزين محلي (Local Storage)، وأن تكون جميع عناصر التصميم (الألوان، الخلفيات، النصوص) قابلة للتبديل السلس بين الوضعين.',
    goal: 'المرونة في واجهة المستخدم.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 4000,
  },
  {
    id: '6',
    title: 'محرك التوصيات (Recommendation Engine)',
    prompt: 'قم بإنشاء نموذج أولي (Prototype) لمحرك توصيات (Recommendation Engine) يعتمد على بيانات المستخدم. يجب أن يقوم الذكاء الاصطناعي بالتوصية بـ: 1) مدربين قريبين بناءً على الرياضة المفضلة وسجل التفاعل، 2) تحديات رياضية جديدة للانضمام إليها بناءً على سجل الأنشطة المكتملة. استخدم خوارزمية التعلم الآلي الأساسية لهذا الغرض.',
    goal: 'تخصيص تجربة المستخدم (التعلم من التفاعل).',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 5000,
  },
  {
    id: '7',
    title: 'المساعد الرياضي الذكي (AI Assistant)',
    prompt: 'طور ميزة المساعد الرياضي المدعوم بالذكاء الاصطناعي (AI Assistant). يجب أن يكون هذا المساعد قادراً على الإجابة على استفسارات المستخدمين حول: التغذية العامة, أفضل تمارين الإحماء لرياضة معينة (مثل كرة القدم)، و تفسير الإحصائيات الرياضية التي يتم تتبعها. يجب أن يتم تصميم هذا المساعد ليتعلم من التفاعلات مع المستخدمين ويحسن دقة إجاباته مع الوقت.',
    goal: 'دعم فوري وتعزيز القيمة المضافة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 6000,
  },
  {
    id: '8',
    title: 'تكامل الصحة الرقمية (Health API Integration)',
    prompt: 'قم بإنشاء واجهة برمجية (API Client) للتكامل مع Google Fit و Apple Health. يجب أن يتمكن المستخدم من منح الإذن للمنصة لسحب البيانات الأساسية لـ: عدد الخطوات, المسافة المقطوعة (GPS Data), و السعرات الحرارية المحروقة. يتم استخدام هذه البيانات لتغذية نظام التحديات.',
    goal: 'دعم ميزة التحديات (FR-COMM-002).',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 7000,
  },
  {
    id: '9',
    title: 'نظام التقييم والمراجعات (Ratings & Reviews)',
    prompt: 'صمم واجهة برمجية للتعامل مع التقييمات والمراجعات. يجب أن يتمكن المستخدم العادي من تقديم تقييم (Rating 1-5 نجوم) ومراجعة نصية لأي مدرب أو مرفق تم حجزه مسبقًا عبر المنصة. يجب أن يتم حساب متوسط التقييم لكل مزود خدمة وتخزينه في قاعدة البيانات.',
    goal: 'بناء الثقة والشفافية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 8000,
  },
  {
    id: '10',
    title: 'تصميم قاعدة البيانات (Database Schema)',
    prompt: 'بصفتك مهندس قواعد بيانات، قم بإنشاء مخطط قاعدة بيانات (Database Schema) كامل وموثق باستخدام **SQL (PostgreSQL)** للمنصة الرياضية المتكاملة. يجب أن يكون المخطط مُصمماً لتحقيق **قابلية التوسع العالية (High Scalability)** ودعم التوطين (i18n).\n\n**قم بتضمين الجداول الأساسية التالية مع تحديد الحقول (Fields)، أنواع البيانات (Data Types)، والمفاتيح الأساسية والأجنبية (Primary & Foreign Keys):**\n\n1.  **جدول المستخدم (User):**\n    * يجب أن يتضمن حقولاً لتخزين البيانات الأساسية والموقع الجغرافي.\n    * يجب أن يدعم حقل **نوع المستخدم** (عادي، مدرب، مرفق رياضي، تاجر).\n2.  **جدول مزود الخدمة (ServiceProvider):**\n    * يحتوي على بيانات المدربين والمرافق (مثل: الاسم، الوصف، **الموقع الجغرافي كنقطة (POINT)** لدعم البحث الجغرافي، **سعر الساعة/الحصة**، وحقل لـ **متوسط التقييم** المحسوب).\n    * يجب أن يكون مرتبطاً بجدول المستخدم (User).\n3.  **جدول الرياضات (Sport):**\n    * لتخزين قائمة بالرياضات المتاحة على المنصة (كرة القدم، اليوغا، إلخ).\n    * يجب أن يدعم التوطين لأسماء الرياضات (i18n).\n4.  **جدول علاقة الرياضة بمزود الخدمة (ProviderSport):**\n    * جدول وسيط يحدد الرياضات التي يقدمها كل مزود خدمة.\n5.  **جدول الحجز (Booking):**\n    * لتسجيل طلبات الحجز. يجب أن يتضمن حقولاً لـ **التاريخ والوقت**، **الحالة** (مؤكد، ملغى، مكتمل)، و **إجمالي المبلغ المدفوع**.\n    * يجب أن يكون مرتبطاً بجدول المستخدم (User) وجدول مزود الخدمة (ServiceProvider).\n6.  **جدول التقييم والمراجعة (Review):**\n    * لتسجيل تقييمات المستخدمين للمدربين والمرافق (النجوم والنص).\n    * يجب أن يكون مرتبطاً بحجز مكتمل لضمان التقييم الشرعي.\n\n**المتطلبات الإضافية:**\n\n* استخدم أنواع بيانات مناسبة لتخزين الموقع الجغرافي لدعم استعلامات **البحث القريب (Geo-spatial Queries)**.\n* أضف حقل **`created_at`** و **`updated_at`** للطابع الزمني في جميع الجداول الرئيسية.',
    goal: 'ضمان تكامل البيانات وقابلية التوسع.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 9000,
  },
  {
    id: '11',
    title: 'هيكل تطبيق الهاتف (Mobile App Shell)',
    prompt: 'بصفتك مطور واجهة أمامية (Frontend Developer)، قم بإنشاء هيكل تطبيق الهاتف المحمول (Mobile Application Shell) باستخدام React Native / Flutter (اختر الأنسب لإمكانية الوصول السريع إلى الميزات).\n\nيجب أن تتضمن الهيكل: 1) إعداد مشروع يدعم اللغة العربية والإنجليزية عبر مكتبات التوطين (i18n) مع ملفات ترجمة منفصلة. 2) مكوناً جاهزاً لتبديل الوضع المظلم/الفاتح باستخدام سياق (Context/Provider) على مستوى التطبيق. 3) إعداد نظام التوجيه (Navigation) الأساسي الذي يتضمن شاشات: التسجيل، تسجيل الدخول، الصفحة الرئيسية، والملف الشخصي.',
    goal: 'تأسيس البنية الأساسية ودعم اللغات والوضع المظلم بشكل معياري.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 10000,
  },
  {
    id: '12',
    title: 'تصميم عناصر الواجهة (UI Components)',
    prompt: 'اعتماداً على الهيكل السابق، صمم ونفذ عناصر الواجهة الرئيسية (UI Components) لتقليد تصاميم تطبيقات التواصل الاجتماعي المعروفة:\n\nقم بإنشاء: 1) شريط تنقل سفلي (Bottom Tab Navigator) يحتوي على أيقونات واضحة لـ: البحث، التحديات، المجتمع، والملف الشخصي. 2) مكون بطاقة الخدمة (Service Card) لعرض المدربين والمرافق، يتضمن صوراً كبيرة وتقييماً نجومياً وموقعاً جغرافياً. 3) تأكد من أن جميع المكونات تدعم التبديل التلقائي بين ألوان الوضع الفاتح والوضع المظلم (Dark Mode) بسلاسة.',
    goal: 'تحقيق المألوفية البصرية (Familiarity).',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 11000,
  },
  {
    id: '13',
    title: 'تكامل المصادقة (Auth Integration)',
    prompt: 'اكتب كود منطق الواجهة الأمامية (Frontend Logic) لربط شاشات التسجيل وتسجيل الدخول بواجهة برمجة تطبيقات (API) المصادقة الخلفية (Backend Authentication API).\n\nيجب أن تتضمن الوظائف ما يلي: 1) استخدام مكتبة قياسية (مثل Axios) لإرسال طلبات POST إلى endpoints التسجيل والدخول. 2) تخزين رمز JWT المميز (Token) المستلم بعد تسجيل الدخول بنجاح في تخزين آمن (مثل AsyncStorage/Secure Storage). 3) إعادة توجيه المستخدم إلى الصفحة الرئيسية عند النجاح.',
    goal: 'ضمان أمان التوكن وانتقال المستخدم.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 12000,
  },
  {
    id: '14',
    title: 'واجهة البحث المتقدم (Advanced Search API)',
    prompt: 'بناء نقطة نهاية (API Endpoint) عالية الأداء للبحث المخصص عن مزودي الخدمات (المدربين/المرافق). يجب أن يدعم البحث تصفية البيانات (Filtering) بناءً على أربعة عوامل رئيسية في نفس الطلب:\n\n1) الموقع الجغرافي: تحديد المزودين الأقرب إلى موقع المستخدم (باستخدام استعلامات Geo-spatial). 2) الرياضة المحددة. 3) متوسط التقييم (أكبر من قيمة معينة). 4) كلمة مفتاحية في اسم المزود أو الوصف. يجب أن يتم ترتيب النتائج حسب الأقرب جغرافياً والأعلى تقييماً.',
    goal: 'تطوير واجهة بحث قوية ودعم ميزات البحث المتقدمة التي تميز المنصة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 13000,
  },
  {
    id: '15',
    title: 'تطوير وظيفة الحجز (Booking Feature)',
    prompt: 'تطوير وحدتي الواجهة الخلفية والأمامية لوظيفة الحجز (Booking).\n\nفي الواجهة الخلفية (Backend): إنشاء منطق التحقق من توفر الخدمة (مثل عدم حجز نفس الملعب في نفس الوقت مرتين) قبل إنشاء سجل جديد في جدول Booking. في الواجهة الأمامية (Frontend): إنشاء واجهة تقويم تفاعلية تسمح للمستخدم باختيار تاريخ ووقت الحجز بسهولة، وعرض الحصص المتاحة فقط.',
    goal: 'إنشاء ميزة الحجز المباشر وضمان دقة الحجوزات وتجربة مستخدم سلسة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 14000,
  },
  {
    id: '16',
    title: 'بوابة الدفع الإلكتروني (Payment Gateway)',
    prompt: 'دمج واجهة برمجية (API) لخدمة دفع خارجية موثوقة (مثل Stripe أو مزود دفع محلي آمن) في عملية الحجز. يجب أن تتضمن الخطوات التالية:\n\n1) إنشاء "نية دفع" (Payment Intent) في الواجهة الخلفية للمبلغ الإجمالي للحجز. 2) معالجة الدفع في الواجهة الأمامية باستخدام واجهة المستخدم الخاصة بالبوابة. 3) تحديث حالة الحجز إلى "مؤكد" فقط بعد نجاح عملية الدفع. 4) تسجيل تفاصيل المعاملة بشكل آمن في سجلات النظام لأغراض المحاسبة وتوزيع العمولات المستقبلية.',
    goal: 'تمكين المعاملات المالية الآمنة والالتزام بمعايير PCI DSS لأمن الدفع.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 15000,
  },
  {
    id: '17',
    title: 'استراتيجية ضمان الجودة والاختبار (QA & Testing)',
    prompt: 'بصفتك مهندس ضمان جودة (QA Engineer)، قم بتطوير خطة اختبار شاملة تركز على **الاختبار الوظيفي، واختبار الأداء، واختبار الأمان** لجميع الميزات المطورة في المراحل السابقة (البحث، الحجز، الدفع، التحديات، الذكاء الاصطناعي). يجب أن يتم تصميم سيناريوهات الاختبار لضمان الالتزام بالمتطلبات الوظيفية (FRs) وغير الوظيفية (NFRs) المحددة في وثيقة SRS.\n\n**التركيز المطلوب لاختبار كل وحدة:**\n\n1.  **اختبار وحدة البحث والتصفية (FR-SEARCH):**\n    * **الاختبار الوظيفي:** اختبار جميع مجموعات التصفية الممكنة (مثلاً: رياضة + موقع + تقييم) لضمان دقة النتائج.\n    * **الاختبار الجغرافي:** التحقق من أن البحث القريب (Geo-spatial search) يعيد النتائج بترتيب صحيح للمسافة من نقطة انطلاق المستخدم.\n    * **اختبار الأداء:** إجراء اختبار حمل (Load Test) على نقطة نهاية البحث للتأكد من أن وقت الاستجابة لا يتجاوز **500 ميلي ثانية** تحت ضغط 500 مستخدم متزامن.\n\n2.  **اختبار وحدة الحجز والدفع (FR-BOOK & FR-ECOM):**\n    * **اختبار سير العمل (Workflow Test):** اختبار السيناريو الكامل للحجز، من اختيار المرفق/المدرب، إلى إتمام عملية الدفع عبر البوابة الخارجية، والتحقق من أن حالة الحجز تغيرت إلى "مؤكد" في قاعدة البيانات.\n    * **اختبار الحالات السلبية (Negative Testing):** محاولة حجز نفس المورد (الملعب/الحصة) في نفس الوقت من قبل مستخدمين مختلفين للتحقق من أن النظام يمنع **الحجز المزدوج (Double Booking)**.\n    * **اختبار الأمان (Security Test):** التحقق من أن جميع بيانات الدفع يتم تمريرها مباشرة عبر البوابة الآمنة (مثل Stripe) دون تخزين أي بيانات حساسة لبطاقة الائتمان على خوادم المنصة (الالتزام بـ PCI DSS).\n\n3.  **اختبار وحدة التحديات والتفاعل (FR-COMM):**\n    * **اختبار التكامل:** التحقق من أن مزامنة البيانات من **Google Fit/Apple Health** تحدث بشكل صحيح وأن تقدم المستخدم في لوحة المتصدرين (Leaderboard) يتم تحديثه بدقة بناءً على البيانات المستوردة.\n    * **اختبار الحدود:** إنشاء تحدي بأقصى عدد مسموح به من المشاركين ومتابعة أدائه.\n    * **اختبار التقييمات:** التأكد من أن المستخدم يمكنه تقديم تقييم فقط بعد إتمام الحجز، وأن متوسط تقييم مزود الخدمة يتم تحديثه بشكل صحيح فور نشر المراجعة.\n\n4.  **اختبار وحدة الذكاء الاصطناعي (AI Assistant):**\n    * **اختبار الدقة (Accuracy Test):** توجيه 50 سؤالاً مختلفاً للمساعد الذكي تتعلق بـ (التغذية، الإحماء، تفسير الإحصائيات) وتقييم دقة إجاباته (يجب أن تتجاوز نسبة الدقة **85%**).\n    * **اختبار التخصيص:** توجيه أسئلة شخصية تعتمد على بيانات المستخدم (مثل "كيف كان أدائي الأسبوع الماضي؟") والتحقق من أن الإجابات تستند بالفعل إلى البيانات المسجلة في ملفه الشخصي والتحديات.\n\n**المتطلبات الختامية:**\n\n* تسجيل جميع النتائج في **ملف تقارير اختبار** موحد (Test Report) يحدد الحالات الناجحة (PASS) والحالات الفاشلة (FAIL) مع وصف دقيق لخطوات إعادة إنتاج الخطأ (Steps to Reproduce) لأي عيوب مكتشفة.\n* التأكد من أن التطبيق يعمل بشكل صحيح على كل من **الويب، و iOS، و Android** (اختبار التوافق).',
    goal: 'ضمان جودة النظام وموثوقية الأداء.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 16000,
  },
  {
    id: '18',
    title: 'تنفيذ واجهة التقييمات (Ratings API Implementation)',
    prompt: 'طور نقطة نهاية (API Endpoint) لـ تسجيل التقييمات والمراجعات. يجب أن يسمح الكود للمستخدم العادي بتقديم تقييم بالنجوم (1-5) ومراجعة نصية لـ مزود الخدمة فقط إذا كان المستخدم قد أتم بنجاح حجزاً سابقاً مع هذا المزود (استناداً إلى جدول Booking حيث تكون الحالة = مكتمل).\n\nبعد كل تقييم جديد، يجب أن يقوم الكود تلقائياً بـ تحديث حقل متوسط التقييم في جدول ServiceProvider لتحقيق الأداء الأمثل للبحث في الوقت الفعلي.',
    goal: 'ضمان مصداقية التقييمات وتحديث الإحصائيات في الوقت الفعلي.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 17000,
  },
  {
    id: '19',
    title: 'تطوير نظام التحديات (Challenges System)',
    prompt: 'أنشئ الهيكل البرمجي والواجهات الخلفية والأمامية لنظام التحديات (Challenges). يجب أن يسمح للمستخدمين بـ: 1) إنشاء تحدي جديد (تحديد الهدف، المدة، نوع الرياضة). 2) دعوة الأصدقاء للانضمام إلى التحدي. 3) عرض لوحة المتصدرين (Leaderboard) التي تُحدث يومياً.\n\nبالإضافة إلى ذلك، قم بإنشاء منطق الواجهة الخلفية (Backend Logic) لاستقبال ومزامنة البيانات من واجهات برمجة تطبيقات Google Fit / Apple Health (كما هو محدد في المرحلة السابقة). يجب أن يقوم هذا المنطق بتحليل البيانات الواردة وتحديث تقدم المستخدم في التحديات النشطة تلقائياً.',
    goal: 'تطوير ميزة التفاعل والمجتمع وربط البيانات الخارجية لتتبع التقدم.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 18000,
  },
  {
    id: '20',
    title: 'دمج نموذج اللغة الكبير (LLM Integration)',
    prompt: 'قم بإنشاء واجهة برمجية لدمج نموذج لغة كبير (Large Language Model - LLM) - مثل نموذج Gemini - ليكون بمثابة المساعد الرياضي الذكي (AI Assistant) داخل التطبيق (Chatbot).\n\nيجب أن تكون وظيفته الأولية هي: 1) الإجابة على استفسارات المستخدمين حول التغذية والتدريب العام. 2) توفير ملخصات مخصصة لأداء المستخدم في التحديات بناءً على البيانات المتوفرة في المنصة (مثل: "لقد تقدمت 10% أكثر هذا الأسبوع في تحدي المشي مقارنة بالمتوسط"). يجب أن يتميز الكود بالاستدعاء الآمن والتحكم في التكلفة (Rate Limiting).',
    goal: 'دمج الذكاء الاصطناعي كميزة أساسية وتخصيص المساعدة بناءً على بيانات المستخدم.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 19000,
  },
  {
    id: '21',
    title: 'لوحة تحكم المسؤول (Admin Dashboard)',
    prompt: 'باستخدام تقنية آمنة وسريعة (مثل React Admin أو Django Admin إذا كانت البنية الخلفية هي Django)، قم ببناء لوحة تحكم شاملة للمسؤول (Admin Dashboard) للتحكم في جميع وظائف المنصة.\n\nيجب أن تتضمن اللوحة: 1) واجهة لإدارة ومراجعة طلبات الاعتماد والتوثيق للمدربين والمرافق. 2) عرض وإدارة جميع سجلات الحجز والمعاملات وتصفيتها حسب التاريخ والحالة. 3) القدرة على إدارة المستخدمين وحظرهم (Users Management & Banning). 4) مقاييس الأداء الرئيسية (KPIs) الأساسية مثل عدد الحجوزات، إجمالي الإيرادات، وعدد المستخدمين النشطين.',
    goal: 'توفير أداة إدارة قوية، آمنة، ومصممة خصيصاً لمراقبة أداء المنصة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 20000,
  },
  {
    id: '22',
    title: 'توزيع الإيرادات والعمولات (Revenue Split)',
    prompt: 'قم بتطوير منطق الواجهة الخلفية (Backend Logic) الذي يدير توزيع الإيرادات (Revenue Split) بين المنصة ومزود الخدمة (المدرب/المرفق) لكل حجز مكتمل.\n\nيجب أن يقوم الكود بحساب العمولة المستحقة للمنصة (مثلاً: 10% من إجمالي الحجز) وتسجيلها. يجب تصميم جدول للمدفوعات المستحقة لمزودي الخدمة، بحيث يتم تحديثه تلقائياً عند إتمام كل حجز. يجب أن يتضمن النظام تقريراً يمكن للمسؤول استخدامه لتسوية الحسابات وإجراء الدفعات الدورية للمزودين.',
    goal: 'تطبيق نموذج العمل (تحصيل العمولات) وأتمتة العمليات المالية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 21000,
  },
  {
    id: '23',
    title: 'إعداد خط أنابيب CI/CD (CI/CD Pipeline)',
    prompt: 'قم بإعداد خط أنابيب تكامل مستمر ونشر مستمر (CI/CD Pipeline) باستخدام أدوات مثل GitHub Actions / GitLab CI لتمكين النشر الآلي للتطبيق الويب والواجهة الخلفية إلى بيئة الإنتاج السحابية (Cloud Production Environment) (AWS/GCP/Azure).',
    goal: 'أتمتة عملية الإطلاق والتحديثات المستقبلية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 22000,
  },
  {
    id: '24',
    title: 'النشر والمراقبة (Deployment & Monitoring)',
    prompt: 'نشر التطبيقات الأصلية للهاتف (iOS/Android) على Apple App Store و Google Play Store بعد إجراء جميع التجهيزات النهائية مثل الإشعارات الفورية (Push Notifications) وشهادات التوقيع. يجب إعداد أدوات المراقبة والتسجيل (Monitoring & Logging) مثل Prometheus/Grafana أو Sentry لتتبع أداء النظام واكتشاف الأخطاء في الوقت الفعلي بعد الإطلاق.',
    goal: 'ضمان سهولة الوصول للمستخدمين واستدامة النظام.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 23000,
  },
  {
    id: '25',
    title: 'استراتيجية الإطلاق (Launch Strategy)',
    prompt: 'بصفتك مستشاراً استراتيجياً للإطلاق، قم بتطوير خطة عمل تفصيلية لـ "المرحلة التجريبية (Soft Launch)" و "الإطلاق الكامل (Full Launch)" للمنصة الرياضية المتكاملة.\n\nيجب أن تتضمن الخطة الأجزاء الرئيسية التالية:\n1. استراتيجية الحصول على مزودي الخدمة (Provider Acquisition): كيف نجذب أول 100 مدرب ومرفق رياضي؟ وما هي العروض الحصرية التي ستقدم لهم في البداية؟\n2. استراتيجية الحصول على المستخدمين (User Acquisition): تحديد القنوات التسويقية الأولية (الإعلانات المدفوعة، وسائل التواصل الاجتماعي، الشراكات) واستهداف الرياضات الأكثر شعبية في المنطقة المستهدفة.\n3. خطة التسعير الأولية (Pricing Strategy): تحديد أي عروض ترويجية للعمولات أو الاشتراكات (إذا وُجدت) خلال الأشهر الثلاثة الأولى من الإطلاق لجذب مزودي الخدمات والمستخدمين.\n4. مؤشرات الأداء الرئيسية للإطلاق (Launch KPIs): تحديد المقاييس التي يجب تتبعها خلال الـ 90 يوماً الأولى (مثل: عدد الحجوزات المكتملة، معدل الاحتفاظ بالمستخدمين، متوسط العائد لكل مستخدم - ARPU).',
    goal: 'تحويل المنتج المكتمل إلى مشروع ناجح ومستدام.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 24000,
  },
  {
    id: '26',
    title: 'بنية التجارة العالمية (Headless Commerce)',
    prompt: 'صمم بنية تجارة إلكترونية "Headless Commerce" تتفوق على المعايير التقليدية. يجب أن تعتمد على GraphQL API لفصل الواجهة الأمامية عن الخلفية تماماً. المتطلبات: 1) دعم تعدد العملات والضرائب العالمية تلقائياً (Global Tax Compliance). 2) معمارية تعتمد على الأحداث (Event-Driven) لمعالجة ملايين الطلبات في الثانية (High Concurrency) مثل Amazon Prime Day. 3) نظام إدارة مخزون موزع (Distributed Order Management - DOM) عبر مستودعات دولية متعددة.',
    goal: 'بناء منصة تجارة عالمية فائقة السرعة والمرونة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 25000,
  },
  {
    id: '27',
    title: 'تجربة التسوق الغامر (AI & AR Shopping)',
    prompt: 'تفوق على تجربة أمازون التقليدية من خلال دمج الواقع المعزز (AR) والذكاء الاصطناعي. صمم المواصفات التقنية لـ: 1) ميزة "القياس الافتراضي" (Virtual Try-On) للأحذية والملابس الرياضية باستخدام كاميرا الهاتف وتقنيات Computer Vision/LiDAR. 2) مستشار تسوق شخصي (Hyper-personalization Engine) يحلل أسلوب لعب الرياضي ويقترح المعدات بناءً على الأداء الفني (Performance Data) وليس فقط سجل الشراء. 3) دعم استعراض المنتجات بتقنية 3D.',
    goal: 'تقديم تجربة تسوق مستقبلية وتفاعلية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 26000,
  },
  {
    id: '28',
    title: 'سلسلة الإمداد الذكية (Smart Logistics 4.0)',
    prompt: 'صمم نظام لوجستي يعتمد على الذكاء الاصطناعي التنبؤي (Predictive AI). يجب أن يتضمن: 1) خوارزميات للتنبؤ بالطلب (Demand Forecasting) لشحن البضائع إلى المستودعات القريبة من العملاء *قبل* أن يطلبوا (Anticipatory Shipping). 2) تحسين مسارات التوصيل في الميل الأخير (Last-Mile Optimization). 3) استخدام Blockchain لتوثيق أصالة المنتجات الرياضية باهظة الثمن ومنع التقليد (Anti-Counterfeiting).',
    goal: 'تحقيق سرعة توصيل قياسية وضمان جودة المنتجات.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 27000,
  },
  {
    id: '29',
    title: 'نظام التسعير الديناميكي (AI Dynamic Pricing)',
    prompt: 'طور محرك تسعير ديناميكي (Dynamic Pricing Engine) للموردين. يجب أن يقوم النظام بتحليل: أسعار المنافسين عالمياً، حجم الطلب الحالي، ومستويات المخزون، لتعديل أسعار المنتجات في الوقت الفعلي (Real-time) لتعظيم الأرباح للموردين مع تقديم أفضل عرض للمشتري (Best Offer).',
    goal: 'تعظيم العوائد والمنافسة الشرسة في السوق.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 28000,
  },
  {
    id: '30',
    title: 'لوحة قيادة الشركاء (Vendor Super-Dashboard)',
    prompt: 'صمم لوحة قيادة تحليلية متقدمة للشركات العارضة (Vendors/Partners). يجب أن تتجاوز أرقام المبيعات التقليدية لتشمل: 1) "خرائط حرارية للحجوزات" (Booking Heatmaps) توضح أوقات الذروة والمواقع الأكثر نشاطاً. 2) تحليل ديموغرافي (مجهول الهوية) للجمهور المستهدف (العمر، الرياضة المفضلة). 3) تصور مرئي لقمع التحويل (Conversion Funnel) للمنتجات والخدمات. الهدف هو تقديم "رؤى قابلة للتنفيذ" (Actionable Insights) وليس مجرد بيانات خام.',
    goal: 'تمكين الشركاء من اتخاذ قرارات تعتمد على البيانات الدقيقة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 29000,
  },
  {
    id: '31',
    title: 'محرك التسويق الجغرافي (Geo-Targeting Engine)',
    prompt: 'طور أدوات تسويقية تسمح للموردين بإنشاء "حملات السياج الجغرافي" (Geofence Campaigns). يجب أن يتمكن المورد من تحديد منطقة جغرافية (مثل ملعب معين أو مسار جري) وإرسال إشعارات ترويجية فورية للمستخدمين عند دخولهم المنطقة (مثلاً: خصم على المشروبات الرياضية). يجب أن يتضمن النظام أدوات للتحكم في الميزانية وتتبع العائد على الاستثمار (ROI) لكل حملة.',
    goal: 'استغلال السياق المكاني لتعظيم تفاعل المستخدمين.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 30000,
  },
  {
    id: '32',
    title: 'مركز رعاية المجتمع (Sponsorship Hub)',
    prompt: 'أنشئ نظاماً يسمح للعلامات التجارية بإنشاء ورعاية "تحديات مجتمعية" (Community Challenges) داخل المنصة. على سبيل المثال: شركة ملابس تنشئ "تحدي الجري 10 كم" وتقدم شارات رقمية أو قسائم خصم حقيقية للفائزين. يجب أن يتضمن النظام آليات للتحقق من إكمال التحدي تلقائياً (عبر Google Fit/Apple Health) وتوزيع الجوائز.',
    goal: 'ربط التجارة بالمجتمع الرياضي بشكل عضوي وتفاعلي.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 31000,
  },
  {
    id: '33',
    title: 'إدارة المحتوى والتصنيف الموحد (Structured Content)',
    prompt: 'صمم نماذج بيانات (Data Models) وواجهات إدخال تضمن التناغم الهيكلي للمنصة. يجب أن تلتزم مدخلات الموردين (مثل مواصفات الملاعب، تجهيزات المدربين) بتصنيفات صارمة (Enums/Taxonomies) محددة مسبقاً في النظام (مثل: نوع الأرضية، المرافق المتاحة). الهدف هو ضمان أن تكون البيانات "قابلة للفلترة" (Filterable) بدقة عالية في محرك البحث.',
    goal: 'ضمان جودة البيانات وسهولة البحث للمستخدم النهائي.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 32000,
  },
  {
    id: '34',
    title: 'تقويم الحجوزات والتسعير الديناميكي (Smart Calendar)',
    prompt: 'طور خوارزمية لإدارة الفتحات الزمنية (Time Slots) تدعم التسعير الديناميكي (Dynamic Pricing). يجب أن يتمكن المورد من تحديد "ساعات الذروة" (Peak Hours) ورفع السعر تلقائياً بنسبة مئوية، أو خفضه في أوقات الركود (Off-Peak). يجب أن يتعامل النظام مع تضارب المواعيد (Conflict Resolution) في الوقت الفعلي.',
    goal: 'تعظيم الاستفادة من الأصول وزيادة الإيرادات.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 33000,
  },
  {
    id: '35',
    title: 'منشئ صفحات الموردين (Storefront Branding)',
    prompt: 'صمم المواصفات التقنية لميزة "تخصيص الواجهة" (Storefront Customization). يجب أن تسمح هذه الميزة للموردين باختيار "ثيمات" (Themes) مختلفة، رفع لافتات إعلانية (Banners) مخصصة، وإعادة ترتيب أقسام الصفحة (Reviews, Offers, Gallery) باستخدام محرر بسيط (No-code Editor)، مما يمنحهم هوية بصرية مميزة داخل المنصة.',
    goal: 'تمكين الموردين من بناء هويتهم التجارية الخاصة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 34000,
  },
  {
    id: '36',
    title: 'تحسين محركات البحث الداخلية (SHEO Engine)',
    prompt: 'طور نظام "تحسين محركات البحث الداخلية" (Search Engine on Platform - SHEO). يجب إضافة حقول مخصصة للكلمات المفتاحية (Keywords) والوصف التعريفي (Meta Description) لكل خدمة أو منتج. يجب أن تستخدم خوارزمية البحث هذه الحقول، بالإضافة إلى التقييمات والموقع، لترتيب النتائج، مما يحفز الموردين على تحسين محتواهم.',
    goal: 'زيادة ظهور الموردين النشطين وتحسين دقة النتائج.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 35000,
  },
  {
    id: '37',
    title: 'تحليل السلاسل الزمنية وتوقع الذروة (Time Series Analysis)',
    prompt: 'صمم نموذجاً تحليلياً باستخدام Python (Pandas/Prophet) لمعالجة بيانات الحجوزات التاريخية. الهدف هو تحديد "أنماط الحجز" (Booking Patterns) بدقة تصل إلى الساعة واليوم لتحديد ساعات الذروة والركود الدقيقة. يجب أن يُخرج النظام توصيات تسعيرية تلقائية تهدف إلى زيادة الإشغال وتقليل الفراغات للموردين.',
    goal: 'تحويل البيانات التاريخية إلى توقعات مستقبلية لتعظيم الإشغال.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 36000,
  },
  {
    id: '38',
    title: 'تحليل سلة المشتريات (Market Basket Analysis)',
    prompt: 'طور خوارزمية (Association Rule Learning) مثل Apriori أو FP-Growth لتحليل معاملات المستخدمين. الهدف هو اكتشاف العلاقات الخفية بين الخدمات (Cross-Selling Opportunities). مثال: "مستخدم يحجز ملعب كرة قدم يشتري غالباً خدمة \'إضاءة إضافية\'". يجب عرض هذه الرؤى للموردين لاقتراح حزم ترويجية (Bundles).',
    goal: 'زيادة متوسط قيمة الطلب (AOV) عبر البيع المتقاطع الذكي.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 37000,
  },
  {
    id: '39',
    title: 'التحليلات الجغرافية المكانية التفاعلية (Geospatial Analytics)',
    prompt: 'صمم واجهة تصور بيانات (Data Visualization) تعرض "خريطة حرارية" (Heatmap) لتوزيع الحجوزات والنشاط. يجب أن تسمح للموردين برؤية المناطق الجغرافية الأكثر تفاعلاً، للمساعدة في توجيه عروضها المحلية والاستراتيجيات التوسعية.',
    goal: 'توجيه العروض المحلية والاستراتيجيات بناءً على الموقع.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 38000,
  },
  {
    id: '40',
    title: 'محرك المقارنة المعيارية التنافسي (Benchmarking Engine)',
    prompt: 'بناء نظام تقارير يقارن أداء المورد (المبيعات، متوسط التقييم، معدل الإشغال) مع "متوسط السوق" أو المنافسين المباشرين في نفس المنطقة والفئة، وذلك بشكل مجهول (Anonymized Data Aggregation). الهدف هو مساعدة المورد على معرفة موقعه في السوق وتحديد الفجوات التنافسية.',
    goal: 'تحديد الفجوات التنافسية وتحسين الأداء.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 39000,
  },
  {
    id: '41',
    title: 'مخططات البيانات الرياضية الديناميكية (Dynamic Sport Profiles)',
    prompt: 'صمم مخطط قاعدة بيانات مرن (باستخدام PostgreSQL JSONB أو NoSQL) يسمح بتعريف "سمات خاصة لكل رياضة". عند اختيار المستخدم رياضته (مثل: كرة قدم، جري، فنون قتالية)، يجب أن تظهر حقول مخصصة (مثال: "مركز اللاعب" لكرة القدم، "أفضل زمن" للجري، "الحزام" للفنون قتالية). يجب أن تكون هذه البيانات قابلة للاستعلام والفهرسة.',
    goal: 'بناء ملف شخصي رياضي عميق ومخصص لكل مستخدم.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 40000,
  },
  {
    id: '42',
    title: 'محرك التوصيات الدقيق والسياقي (Precision AI Engine)',
    prompt: 'طور خوارزمية توصية (Recommendation Algorithm) تستخدم البيانات العميقة للملف الشخصي لتقديم اقتراحات سياقية دقيقة. مثال: إذا كان المستخدم "مدافع" في كرة القدم، يجب أن يقترح النظام مدربين متخصصين في التكتيكات الدفاعية، وليس تدريب عام. يجب أن يشمل ذلك تصفية المحتوى والمنتجات.',
    goal: 'تقديم تجربة فائقة التخصيص تشعر المستخدم بأن المنصة تفهمه.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 41000,
  },
  {
    id: '43',
    title: 'لوحات الصدارة المقطعية العادلة (Segmented Leaderboards)',
    prompt: 'صمم منطق الواجهة الخلفية (Backend Logic) لحساب وعرض لوحات صدارة مقسمة بذكاء. يجب ألا يتنافس المستخدمون بشكل عشوائي، بل ضمن مجموعات: (نفس الرياضة + نفس المستوى المهاري + نفس المنطقة الجغرافية). الهدف هو خلق منافسة عادلة ومحفزة لكل شريحة.',
    goal: 'تعزيز التنافسية العادلة وزيادة ارتباط المستخدمين.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 42000,
  },
  {
    id: '44',
    title: 'نظام الشارات ومسار الرحلة (Advanced Gamification)',
    prompt: 'صمم نظام تلعيب (Gamification System) متقدم يمنح "شارات تخصصية" بناءً على الإنجازات الفعلية (مثال: شارة "الرأس الذهبي" للاعب كرة القدم بعد 10 مباريات). أضف تصوراً لـ "مسار رحلة المستخدم" (User Journey Path) يظهر تقدمه من مستوى لآخر بناءً على النشاط.',
    goal: 'تحفيز المستخدمين عبر مكافآت ذات معنى وهويّة رياضية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 43000,
  },
  {
    id: '45',
    title: 'لوحة تحكم اللاعب المخصصة (Personalized Dashboard)',
    prompt: 'صمم واجهة أمامية (Frontend Layout) للوحة التحكم تتغير ديناميكياً بناءً على الرياضة الأساسية للمستخدم. يجب أن تعرض "ويدجت" (Widgets) مختلفة (مثال: عداء يرى رسم بياني للمسافات، لاعب تنس يرى إحصائيات الملاعب الصلبة vs العشبية).',
    goal: 'توفير تجربة مستخدم فريدة تعكس اهتماماته بدقة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 44000,
  },
  {
    id: '46',
    title: 'هيكلة إدارة الموارد المتعددة (Unified Resource Management)',
    prompt: 'صمم مخطط قاعدة بيانات (Database Schema) لدعم إدارة الكيانات المتعددة (Multi-Entity/Tenant). يجب أن يسمح النظام للمالك بإدارة "فروع" (Branches) متعددة، وكل فرع يحتوي على "موارد" (Resources) متنوعة (ملاعب، مسابح، مواقف سيارات). يجب أن يدعم النظام التسلسل الهرمي للمستخدمين (مالك، مدير فرع، موظف استقبال).',
    goal: 'إدارة مركزية لجميع الأصول والمرافق بغض النظر عن نوعها أو موقعها.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 45000,
  },
  {
    id: '47',
    title: 'محرك التسعير الديناميكي الذكي (AI Dynamic Pricing Engine)',
    prompt: 'طور خوارزمية (Algorithm) لتحسين العائد (Yield Optimization). يجب أن تقترح الخوارزمية الأسعار المثالية لكل ساعة بناءً على: 1) الطلب التاريخي والفعلي. 2) معدلات الإلغاء المتوقعة. 3) أسعار المنافسين في المنطقة الجغرافية. يجب أن تسمح للمالك بوضع قواعد تسعير مخصصة (Rules-based Pricing).',
    goal: 'تعظيم الإيرادات عبر استغلال أوقات الذروة وتقليل الفاقد في أوقات الركود.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 46000,
  },
  {
    id: '48',
    title: 'نظام إدارة الصيانة والتشغيل (Maintenance & Operations)',
    prompt: 'صمم وحدة (Module) لجدولة الصيانة الوقائية والطارئة. يجب أن يتكامل النظام مع التقويم لحجب فترات الصيانة تلقائياً ومنع الحجز فيها. أضف ميزات لتعيين المهام للموظفين (مثل النظافة وفحص المعدات) وتتبع التكاليف التشغيلية لكل مورد (Cost Tracking).',
    goal: 'ضمان استمرارية التشغيل وتقليل أوقات التعطل المفاجئة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 47000,
  },
  {
    id: '49',
    title: 'إدارة العقود والحجوزات المتكررة (Recurring Contracts Manager)',
    prompt: 'طور نظاماً لإدارة العقود طويلة الأجل (B2B/Long-term). يجب أن يتيح إنشاء حجوزات متكررة معقدة (مثلاً: كل ثلاثاء وخميس لمدة 6 أشهر) مع كشف التعارضات تلقائياً. يجب أن يتضمن النظام تنبيهات آلية للفواتير والمدفوعات المستحقة للعقود الآجلة.',
    goal: 'تسهيل إدارة العلاقات مع الأكاديميات والفرق والشركات.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 48000,
  },
  {
    id: '50',
    title: 'ذكاء الأعمال للمنشآت (Venue BI & Analytics)',
    prompt: 'صمم لوحة مؤشرات أداء (KPI Dashboard) متقدمة للملاك. يجب أن تعرض تقارير عن: 1) معدل الإشغال (Occupancy Rate) لكل ملعب. 2) الإيراد لكل ساعة متاحة (RevPAH). 3) تحليل سلوك الإلغاء (Cancellation Trends). 4) صافي الربحية لكل مورد بعد خصم تكاليف التشغيل.',
    goal: 'تحويل البيانات التشغيلية إلى قرارات استراتيجية لزيادة الربحية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 49000,
  },
  {
    id: '51',
    title: 'مستشار التوسع والاستثمار (Investment AI Advisor)',
    prompt: 'طور منطقاً تحليلياً يدرس "الطلب الضائع" (Lost Demand) - أي الحجوزات التي لم تتم لعدم توفر المكان. بناءً على هذه البيانات، يجب أن يقدم النظام توصيات استراتيجية للمالك، مثل: "هناك طلب مرتفع على ملاعب التنس مساءً، يُنصح بإضافة ملعب جديد أو تحويل مساحة غير مستغلة".',
    goal: 'توجيه المالك نحو فرص الاستثمار والتوسع الأكثر جدوى.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 50000,
  },
  {
    id: '52',
    title: 'محرك تخصيص نمط المالك (Owner Persona Engine)',
    prompt: 'صمم منطق الواجهة الخلفية (Backend Logic) لدعم أنماط ملاك مختلفة (Personas). يجب أن يغير النظام سلوكه وواجهته بناءً على نوع المالك: "خاص/ربحي" (يركز على الإيرادات) مقابل "عام/بلدي" (يركز على الخدمة المجتمعية). حدد إعدادات التكوين (Configuration Settings) لكل نمط ومجموعات الميزات المتاحة.',
    goal: 'تخصيص التجربة لتلبية الأهداف الاستراتيجية المتباينة للملاك.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 51000,
  },
  {
    id: '53',
    title: 'لوحة قيادة القطاع الخاص (Profit-Driven Dashboard)',
    prompt: 'طور لوحة تحكم ومؤشرات أداء (KPIs) مخصصة للملاك من القطاع الخاص. التركيز يجب أن يكون على: صافي الإيرادات (Net Revenue)، هامش الربح التشغيلي (Operating Margin)، والعائد على الاستثمار (ROI). أضف أدوات لربط التسعير الديناميكي بهذه المؤشرات لتعظيم الربح.',
    goal: 'تمكين القطاع الخاص من تعظيم العوائد المالية والكفاءة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 52000,
  },
  {
    id: '54',
    title: 'نظام إدارة المرافق العامة والبلدية (Municipal Management System)',
    prompt: 'صمم ميزات تشغيلية مخصصة للقطاع العام. يجب أن يتتبع النظام: "معدل الإتاحة المجتمعية" (Community Availability)، "تكلفة التشغيل لكل مستخدم" (Cost per User)، ومعدل استخدام السكان المحليين. أضف وحدة لإدارة الدعم الحكومي/الإعانات (Subsidy Management) وتقارير الشفافية.',
    goal: 'إدارة الموارد العامة بكفاءة وضمان العدالة الاجتماعية والشفافية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 53000,
  },
  {
    id: '55',
    title: 'محرك التسعير الهجين وإدارة الدعم (Hybrid Pricing & Subsidy Engine)',
    prompt: 'طور وحدة تسعير مرنة تدعم كلا النمطين: 1) للقطاع الخاص: خوارزميات تسعير ديناميكي لتعظيم الربح في ساعات الذروة. 2) للقطاع العام: نظام إدارة "الدعم والحصص" (Quota & Subsidy Management) يسمح بتخصيص فترات مجانية أو مخفضة لشرائح معينة (مثل المدارس). يجب أن يدعم النظام قواعد تسعير معقدة.',
    goal: 'تلبية احتياجات الربحية والمسؤولية الاجتماعية في آن واحد.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 54000,
  },
  {
    id: '56',
    title: 'إدارة الأصول والمخزون الذكي (Smart Asset & Inventory)',
    prompt: 'صمم نظاماً لتتبع الأصول والمخزون (Asset Tracking). يجب أن يتتبع حالة المعدات الرياضية وجدول صيانتها. الميزة الأساسية هي القدرة على تخصيص تكاليف الصيانة إما لـ "النفقات التشغيلية" (OPEX) للقطاع الخاص، أو لـ "ميزانية الخدمة العامة" (Public Budget) للقطاع الحكومي.',
    goal: 'تحسين كفاءة الموارد وتقليل الهدر.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 55000,
  },
  {
    id: '57',
    title: 'محرك التقارير المزدوج (Dual-Mode Reporting)',
    prompt: 'أنشئ محرك تقارير ذكي يوفر نوعين من المخرجات: 1) تقارير مالية وضريبية مفصلة للملاك الخواص. 2) "تقارير الأثر المجتمعي" (Social Impact Reports) للملاك العموميين، توضح عدد المستفيدين من الدعم وساعات الاستخدام المجتمعي. يجب أن تكون التقارير قابلة للتصدير.',
    goal: 'تقديم الشفافية المالية والمجتمعية المطلوبة لكل قطاع.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 56000,
  },
  {
    id: '58',
    title: 'تحليل الطلب الضائع والاستثمار (Lost Demand & Investment)',
    prompt: 'طور خوارزمية لتحليل "الطلب الضائع" (Lost Demand) - أي محاولات الحجز الفاشلة. يجب أن يستخدم النظام هذه البيانات لاقتراح فرص استثمارية (مثل: "زيادة ملاعب البادل") أو تعديل سياسات الحجز لزيادة الإتاحة.',
    goal: 'تحويل البيانات السلبية إلى فرص نمو استراتيجية.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 57000,
  },
  {
    id: '59',
    title: 'نظام الصلاحيات الهرمي (Hierarchical ACL System)',
    prompt: 'صمم نظام إدارة وصول (ACL) متقدم يدعم الهياكل المعقدة. يجب أن يسمح بوجود مسؤولين على مستوى البلدية/الشركة الأم، ومديرين على مستوى الفرع، وموظفين بمهام محددة. يجب أن يضمن أمن البيانات المالية وحصرها على ذوي الصلاحية.',
    goal: 'ضمان الأمن والتحكم في المؤسسات الكبيرة ومتعددة الفروع.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 58000,
  },
  {
    id: '60',
    title: 'البنية المرنة للبيانات (Flexible Data Architecture)',
    prompt: 'صمم مخططاً لقاعدة البيانات (Data Architecture) يتميز بالمرونة العالية لدعم المدخلات المالية (مثل التكلفة، هامش الربح) والمدخلات غير المالية (مثل الإعانات، الأهداف الخدمية) في نفس الوقت. يجب أن يتيح النظام تخزين هذه البيانات المختلفة لهياكل كيانات متعددة دون تعارض.',
    goal: 'توفير أساس تقني يدعم النماذج التشغيلية المتباينة بكفاءة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 59000,
  },
  {
    id: '61',
    title: 'واجهة التبديل بين الأنماط (Mode Toggle UI)',
    prompt: 'صمم مكون واجهة مستخدم (UI Component) في لوحة الإعدادات يسمح للمالك بالتبديل الفوري بين "نمط الربحية" و "نمط الخدمة العامة". عند التبديل، يجب أن تتغير أولويات لوحة القيادة والتقارير المعروضة ديناميكياً لتناسب النمط المختار.',
    goal: 'تجربة مستخدم مخصصة وسلسة تتماشى مع استراتيجية المالك.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 60000,
  },
  {
    id: '62',
    title: 'تحليل سلوك المستهلك (Consumer Behavior Analysis)',
    prompt: 'طور خوارزمية تحليلية تدرس اتجاهات الطلب على أنواع الرياضات المختلفة (مثل زيادة الطلب على البادل مقابل التنس). يجب أن يقدم النظام رؤى قابلة للتنفيذ حول تحويل الموارد أو تعديلها بناءً على تغير تفضيلات المستهلكين.',
    goal: 'مساعدة الملاك في اتخاذ قرارات استراتيجية مبنية على بيانات السوق.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 61000,
  },
  {
    id: '63',
    title: 'التصميم التفصيلي وبنية النظام (Final System Architecture)',
    prompt: 'بناءً على جميع المخرجات السابقة للمشروع، قم بإعداد "وثيقة تصميم معمارية النظام الشاملة" (Detailed System Architecture Design) و "هيكلية المشروع النهائية" (Final Project Structure).\n\nيجب أن تكون هذه الوثيقة المرجع التنفيذي للمطورين وتتضمن:\n\n1. **هيكلية الملفات والمجلدات (File System Structure):**\n   - قدم شجرة ملفات كاملة (File Tree) للمشروع (Monorepo أو Polyrepo).\n   - حدد مسارات ملفات التكوين (Dockerfiles, k8s manifests, ci/cd pipelines).\n   - حدد مسارات الكود المصدري لكل خدمة (Auth, Booking, Search).\n\n2. **مكدس التكنولوجيا (Technology Stack Matrix):**\n   - جدول يحدد بوضوح: اللغة، إطار العمل، قاعدة البيانات، ومنفذ الخدمة (Port) لكل Microservice.\n\n3. **المخطط المعماري الشامل (Master Architecture Diagram):**\n   - استخدم Mermaid.js لرسم تفاعل جميع الخدمات (Auth, Booking, Payment, Notification) مع البوابة (Gateway) وقواعد البيانات.\n\n4. **خطة البنية التحتية (Infrastructure):**\n   - تفاصيل نشر Kubernetes (Ingress, Services, Deployments).\n\nالهدف: توحيد الرؤية التقنية وهيكلة الملفات لبدء التنفيذ فوراً.',
    goal: 'دمج كافة المهام في وثيقة معمارية وهيكلية موحدة.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 62000,
  },
  {
    id: '64',
    title: 'مرحلة التطوير - بناء قاعدة البيانات (Database Implementation)',
    prompt: 'بناءً على مخطط ERD النهائي (الذي تم تصميمه سابقاً)، قم بكتابة كود SQL الفعلي (أو ملفات Migration الخاصة بـ Django/Sequelize) لإنشاء الجداول في قاعدة البيانات.\n\nالمتطلبات التقنية:\n1) إنشاء الجداول الرئيسية: Users, Providers, Bookings, Reviews, Sports.\n2) تعريف المفاتيح الأساسية (Primary Keys) والأجنبية (Foreign Keys) والعلاقات بدقة.\n3) إضافة الفهارس (Indexes) اللازمة لتحسين أداء البحث (خاصة للحقول الجغرافية والتواريخ).\n4) كتابة سكربت بيانات أولية (Seed Data) لإضافة أنواع الرياضات الأساسية وحساب مسؤول (Admin) افتراضي.',
    goal: 'تنفيذ الطبقة الفيزيائية لقاعدة البيانات وتجهيزها للاستخدام.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 63000,
  },
  {
    id: '65',
    title: 'مرحلة التطوير - برمجة الواجهة الخلفية (Backend Development)',
    prompt: 'قم بكتابة الكود المصدري (Source Code) للخدمات المصغرة الأساسية (Core Microservices) بناءً على تصميم الـ Sequence Diagram.\n\nالمطلوب:\n1) كود خدمة المصادقة (Auth Service): تنفيذ وظائف التسجيل وتسجيل الدخول وإصدار JWT.\n2) كود خدمة الحجز (Booking Service): تنفيذ الـ API Endpoints لإنشاء حجز جديد، الاستعلام عن التوفر، وإلغاء الحجز.\n3) ملف `docker-compose.yml` لتشغيل هذه الخدمات محلياً مع قاعدة البيانات.\n\nملاحظة: اكتب الكود الفعلي (Python/Node.js) مع التعليقات التوضيحية.',
    goal: 'بناء منطق الأعمال (Business Logic) والـ APIs.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 64000,
  },
  {
    id: '66',
    title: 'مرحلة التطوير - بناء الواجهة الأمامية (Frontend Development)',
    prompt: 'قم بكتابة كود الواجهة الأمامية لتطبيق الهاتف (Mobile App) باستخدام React Native أو Flutter (حسب ما تم اختياره في التكنولوجيا).\n\nالمطلوب:\n1) تنفيذ شاشة تسجيل الدخول (Login Screen) وربطها بـ API المصادقة.\n2) تنفيذ شاشة "حجز ملعب" (Booking Screen) التي تعرض الملاعب المتاحة وتسمح للمستخدم باختيار الوقت.\n3) استخدام State Management (مثل Context API أو Provider) لإدارة حالة المستخدم.\n4) تنسيق الواجهة (Styling) لتكون متجاوبة وتدعم الوضع المظلم.',
    goal: 'تحويل التصاميم إلى واجهة مستخدم تفاعلية وقابلة للاستخدام.',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 65000,
  },
  {
    id: '67',
    title: 'مرحلة التطوير - التكامل والربط (System Integration)',
    prompt: 'هذه هي مرحلة تجميع النظام (Integration Phase). قم بكتابة الكود والإعدادات اللازمة لربط الواجهة الأمامية بالخلفية بشكل كامل.\n\nالمطلوب:\n1) إعداد Gateway (مثل Nginx أو API Gateway) لتوجيه الطلبات من التطبيق إلى الخدمات المناسبة.\n2) كتابة كود الـ API Client في الواجهة الأمامية (Axios/Fetch) للتعامل مع الأخطاء (Error Handling) وإعادة المحاولة.\n3) سيناريو اختبار تكاملي (Integration Test Script) يتحقق من دورة حياة كاملة: تسجيل مستخدم -> بحث عن ملعب -> إجراء حجز.',
    goal: 'ضمان عمل النظام كوحدة واحدة متكاملة (End-to-End Functionality).',
    status: TaskStatus.PENDING,
    createdAt: Date.now() - 66000,
  }
];