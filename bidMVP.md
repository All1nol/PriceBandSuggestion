# SalesPatriot Price Band Suggestion MVP - Next.js + PocketFlow Build Guide
*16-20 Hour Sprint Build Plan with Modern Stack*

## Project Overview
Build a full-stack Price Band Suggestion feature using:
- **Frontend/Backend**: Next.js 14 App Router (unified full-stack)
- **Agent Orchestration**: PocketFlow (100-line AI framework)
- **Database**: SQLite with Prisma ORM
- **AI Workflow**: PDF extraction → price suggestion pipeline

## Why This Stack?
- **Next.js 14**: Server/client components, API routes, unified deployment
- **PocketFlow**: Minimal AI orchestration perfect for AI-driven workflows
- **Prisma**: Type-safe database with great Next.js integration
- **Single Container**: Easy demo deployment

## Tech Architecture
```
┌─────────────────────────────────────┐
│ Next.js 14 App Router               │
├─────────────────────────────────────┤
│ Frontend: React Server Components   │
│ Backend: API Routes (/app/api/*)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ PocketFlow Agent Orchestration      │
├─────────────────────────────────────┤
│ ExtractorAgent → PricingAgent       │
│ → AuditAgent → NotificationAgent    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Database: SQLite + Prisma           │
│ File Storage: /public/uploads       │
└─────────────────────────────────────┘
```

## Database Schema (Prisma)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./salespatriot.db"
}

model Solicitation {
  id           String   @id @default(cuid())
  filename     String
  filePath     String
  status       String   @default("uploaded") // uploaded, extracted, suggested
  rawText      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  extractedData ExtractedData?
  suggestions   PriceSuggestion[]
  auditLogs     AuditLog[]
}

model ExtractedData {
  id              String        @id @default(cuid())
  solicitationId  String        @unique
  nsn             String?
  quantity        Int?
  deliveryDays    Int?
  description     String?
  confidenceScore Float         @default(0.0)
  createdAt       DateTime      @default(now())
  
  solicitation    Solicitation  @relation(fields: [solicitationId], references: [id])
}

model PriceSuggestion {
  id               String        @id @default(cuid())
  solicitationId   String
  priceLow         Float
  priceHigh        Float
  confidencePercent Int
  rationale        String        // JSON array
  baseCost         Float
  marginFactor     Float
  createdAt        DateTime      @default(now())
  
  solicitation     Solicitation  @relation(fields: [solicitationId], references: [id])
}

model AuditLog {
  id             String        @id @default(cuid())
  solicitationId String
  action         String        // uploaded, extracted, suggested, edited
  details        String        // JSON string
  createdAt      DateTime      @default(now())
  
  solicitation   Solicitation  @relation(fields: [solicitationId], references: [id])
}
```

## PocketFlow Agent Workflow
```typescript
// lib/agents/workflow.ts
import { PocketFlow, Node, Flow } from 'pocketflow';

class ExtractorNode extends Node {
  async execute(context: any) {
    const { filePath } = context;
    
    // PDF extraction logic
    const extracted = await this.extractFromPDF(filePath);
    
    return {
      ...context,
      extracted,
      status: 'extracted'
    };
  }
  
  private async extractFromPDF(filePath: string) {
    // Implementation here
  }
}

class PricingNode extends Node {
  async execute(context: any) {
    const { extracted } = context;
    
    // Pricing calculation logic
    const suggestion = await this.calculatePriceBand(extracted);
    
    return {
      ...context,
      suggestion,
      status: 'suggested'
    };
  }
  
  private async calculatePriceBand(extracted: any) {
    // Implementation here
  }
}

class AuditNode extends Node {
  async execute(context: any) {
    const { solicitationId, action, details } = context;
    
    // Log to database
    await this.logAuditEvent(solicitationId, action, details);
    
    return context;
  }
}

// Main workflow orchestration
export class SolicitationWorkflow extends Flow {
  constructor() {
    super();
    
    this.addNode('extractor', new ExtractorNode());
    this.addNode('pricing', new PricingNode());
    this.addNode('audit', new AuditNode());
    
    // Define workflow graph
    this.addEdge('extractor', 'pricing');
    this.addEdge('pricing', 'audit');
  }
  
  async processDocument(solicitationId: string, filePath: string) {
    const context = {
      solicitationId,
      filePath,
      startTime: Date.now()
    };
    
    return await this.execute(context);
  }
}
```

## Next.js Project Structure
```
salespatriot-mvp/
├── app/
│   ├── api/
│   │   ├── solicitations/
│   │   │   ├── route.ts              # POST /api/solicitations
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET/PUT /api/solicitations/[id]
│   │   │       ├── extract/
│   │   │       │   └── route.ts      # POST /api/solicitations/[id]/extract
│   │   │       ├── suggest/
│   │   │       │   └── route.ts      # POST /api/solicitations/[id]/suggest
│   │   │       └── audit/
│   │   │           └── route.ts      # GET /api/solicitations/[id]/audit
│   │   └── upload/
│   │       └── route.ts              # File upload endpoint
│   ├── components/
│   │   ├── SolicitationWorkflow.tsx
│   │   ├── StatusCard.tsx
│   │   ├── ExtractionPanel.tsx
│   │   ├── SuggestionPanel.tsx
│   │   └── AuditPanel.tsx
│   ├── lib/
│   │   ├── agents/
│   │   │   └── workflow.ts           # PocketFlow agents
│   │   ├── services/
│   │   │   ├── extraction.ts
│   │   │   └── pricing.ts
│   │   └── db.ts                     # Prisma client
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Main app page
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/                      # File storage
└── package.json
```

## Hour-by-Hour Build Plan (Revised)

### Hours 1-3: Foundation Setup
1. **Next.js + Dependencies** (45 min)
   ```bash
   npx create-next-app@latest salespatriot-mvp --typescript --tailwind --app
   npm install prisma @prisma/client pdf-parse multer
   npm install pocketflow  # If available, or implement minimal version
   ```

2. **Database Setup** (45 min)
   - Create Prisma schema
   - `npx prisma generate && npx prisma db push`
   - Create seed data

3. **File Upload API** (90 min)
   - `/app/api/upload/route.ts` with file handling
   - Multer integration for PDF uploads
   - Basic error handling

### Hours 4-6: PocketFlow Agent System
1. **Minimal PocketFlow Implementation** (90 min)
   - Create core Node and Flow classes (if not using package)
   - ExtractorNode with PDF parsing
   - Basic NSN/quantity regex extraction

2. **Pricing Agent** (90 min)
   - PricingNode with category-based logic
   - Price band calculation with confidence
   - Rationale generation

### Hours 7-10: Next.js API Routes
1. **Core API Endpoints** (120 min)
   ```typescript
   // app/api/solicitations/route.ts
   export async function POST(request: Request) {
     const formData = await request.formData();
     // Handle file upload and create solicitation
   }
   
   // app/api/solicitations/[id]/extract/route.ts
   export async function POST(request: Request, { params }: { params: { id: string } }) {
     const workflow = new SolicitationWorkflow();
     const result = await workflow.processDocument(params.id, filePath);
     // Save to database via Prisma
   }
   ```

2. **Integration with PocketFlow** (120 min)
   - Wire workflow orchestration to API routes
   - Database persistence with Prisma
   - Error handling and status updates

### Hours 11-14: Frontend Components
1. **Main Workflow UI** (120 min)
   ```typescript
   // app/components/SolicitationWorkflow.tsx
   'use client';
   
   export default function SolicitationWorkflow() {
     const [status, setStatus] = useState('upload');
     const [data, setData] = useState(null);
     
     const handleExtract = async () => {
       const response = await fetch(`/api/solicitations/${id}/extract`, {
         method: 'POST'
       });
       // Handle response
     };
     
     return (
       <div className="workflow-container">
         <StatusTimeline status={status} />
         <ActionPanels onExtract={handleExtract} data={data} />
       </div>
     );
   }
   ```

2. **UI Components** (120 min)
   - StatusCard with timeline
   - ExtractionPanel with editable fields
   - SuggestionPanel with price display
   - Upload zone with drag/drop

### Hours 15-16: Integration & Demo
1. **End-to-End Testing** (60 min)
   - Test complete workflow
   - Fix integration issues
   - Performance optimization

2. **Demo Preparation** (60 min)
   - Create sample PDFs
   - Prepare demo script
   - Deploy to Vercel or local Docker

## Key Files Implementation

### API Route: Extract Document
```typescript
// app/api/solicitations/[id]/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SolicitationWorkflow } from '@/lib/agents/workflow';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id: params.id }
    });
    
    if (!solicitation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Execute PocketFlow workflow
    const workflow = new SolicitationWorkflow();
    const result = await workflow.processDocument(params.id, solicitation.filePath);
    
    // Save extracted data
    await prisma.extractedData.create({
      data: {
        solicitationId: params.id,
        nsn: result.extracted.nsn,
        quantity: result.extracted.quantity,
        deliveryDays: result.extracted.deliveryDays,
        description: result.extracted.description,
        confidenceScore: result.extracted.confidenceScore,
      }
    });
    
    // Update status
    await prisma.solicitation.update({
      where: { id: params.id },
      data: { status: 'extracted' }
    });
    
    return NextResponse.json({
      success: true,
      extracted: result.extracted
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Extraction failed' },
      { status: 500 }
    );
  }
}
```

### Main App Page
```typescript
// app/page.tsx
import SolicitationWorkflow from './components/SolicitationWorkflow';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">SalesPatriot - AI Price Suggestion</h1>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <SolicitationWorkflow />
      </div>
    </main>
  );
}
```

## Package.json
```json
{
  "name": "salespatriot-mvp",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "pdf-parse": "^1.1.1",
    "multer": "^1.4.5-lts.1",
    "@types/multer": "^1.4.7"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "tsx": "^4.0.0"
  }
}
```

## PocketFlow Integration Benefits
- **Agent Orchestration**: Clean separation of extraction, pricing, and audit logic
- **Extensible**: Easy to add new agents (compliance checker, competitor analysis)
- **Observable**: Built-in logging and state management
- **AI-Native**: Perfect for future ML model integration

## Demo Script (2 minutes)
1. **"AI-Powered Defense Contracting"** - Show the value prop
2. **Upload RFQ PDF** - Drag/drop demonstration  
3. **Agent Extraction** - "Watch PocketFlow orchestrate the AI workflow"
4. **Price Suggestion** - "Intelligent bands with compliance rationale"
5. **Audit Trail** - "Full transparency for defense requirements"
6. **Scale Discussion** - "Ready for ML models and enterprise deployment"

## Deployment Options
```bash
# Development
npm run dev

# Production Build
npm run build && npm start

# Docker (single container)
FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Interview Extensions to Discuss
- **Multi-Agent Workflows**: "How would you add compliance checking agents?"
- **Real-time Updates**: "WebSocket integration for status streaming"
- **Enterprise Features**: "Multi-tenancy, RBAC, audit compliance"
- **ML Integration**: "Swapping heuristic pricing for learned models"
- **Scalability**: "Event-driven architecture with queues"

---

**Ready to build the future of defense contracting! 🚀**

This modern stack showcases full-stack skills, AI orchestration understanding, and production-ready patterns that will impress any startup interview.