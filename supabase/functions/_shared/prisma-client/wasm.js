
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  internCode: 'internCode',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  division: 'division',
  periodStartDate: 'periodStartDate',
  periodEndDate: 'periodEndDate',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  profilePicUrl: 'profilePicUrl',
  phoneNumber: 'phoneNumber',
  joinDate: 'joinDate',
  isActive: 'isActive',
  mentorId: 'mentorId'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  type: 'type',
  timestamp: 'timestamp',
  description: 'description',
  photoUrl: 'photoUrl',
  latitude: 'latitude',
  longitude: 'longitude',
  isLate: 'isLate',
  userId: 'userId'
};

exports.Prisma.HelpdeskTicketScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  description: 'description',
  proofUrl: 'proofUrl',
  status: 'status',
  userId: 'userId'
};

exports.Prisma.DailyLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  activity: 'activity',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.PredefinedActivityScalarFieldEnum = {
  id: 'id',
  task: 'task'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INTERN: 'INTERN'
};

exports.AttendanceType = exports.$Enums.AttendanceType = {
  Hadir: 'Hadir',
  Pulang: 'Pulang',
  Izin: 'Izin'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED'
};

exports.LogStatus = exports.$Enums.LogStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Attendance: 'Attendance',
  HelpdeskTicket: 'HelpdeskTicket',
  DailyLog: 'DailyLog',
  PredefinedActivity: 'PredefinedActivity'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "edge_client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\test\\absen-magang\\supabase\\functions\\_shared\\prisma-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "deno",
      "driverAdapters"
    ],
    "sourceFilePath": "C:\\Users\\test\\absen-magang\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../../.env"
  },
  "relativePath": "../../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\ngenerator edge_client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\", \"deno\"]\n  output          = \"../supabase/functions/_shared/prisma-client\"\n}\n\ndatasource db {\n  provider  = \"postgresql\"\n  url       = env(\"DATABASE_URL\")\n  directUrl = env(\"DATABASE_URL_DIRECT\")\n}\n\nmodel User {\n  id              Int       @id @default(autoincrement())\n  internCode      String?   @unique\n  name            String\n  email           String?   @unique\n  password        String\n  role            Role      @default(INTERN)\n  division        String\n  periodStartDate DateTime?\n  periodEndDate   DateTime?\n  bankName        String?\n  accountNumber   String?\n  profilePicUrl   String?\n  phoneNumber     String?\n  joinDate        DateTime  @default(now())\n  isActive        Boolean   @default(true)\n\n  attendances     Attendance[]\n  helpdeskTickets HelpdeskTicket[]\n\n  mentorId  Int?\n  mentor    User?      @relation(\"MentorToInterns\", fields: [mentorId], references: [id])\n  interns   User[]     @relation(\"MentorToInterns\")\n  dailyLogs DailyLog[]\n}\n\nmodel Attendance {\n  id          Int            @id @default(autoincrement())\n  type        AttendanceType\n  timestamp   DateTime       @default(now())\n  description String\n  photoUrl    String?\n  latitude    Float?\n  longitude   Float?\n  isLate      Boolean        @default(false)\n  userId      Int\n  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel HelpdeskTicket {\n  id          Int          @id @default(autoincrement())\n  createdAt   DateTime     @default(now())\n  description String       @db.Text\n  proofUrl    String?\n  status      TicketStatus @default(OPEN)\n  userId      Int\n  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel DailyLog {\n  id        Int       @id @default(autoincrement())\n  userId    Int\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  activity  String    @db.Text\n  status    LogStatus @default(PENDING)\n  notes     String? // Catatan dari mentor saat mereview\n  createdAt DateTime  @default(now())\n}\n\nmodel PredefinedActivity {\n  id   Int    @id @default(autoincrement())\n  task String @unique // Nama tugas/aktivitasnya\n}\n\nenum Role {\n  SUPER_ADMIN\n  ADMIN\n  INTERN\n}\n\nenum AttendanceType {\n  Hadir\n  Pulang\n  Izin\n}\n\nenum TicketStatus {\n  OPEN\n  IN_PROGRESS\n  RESOLVED\n}\n\nenum LogStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n",
  "inlineSchemaHash": "6fd2b3a1f17ce7592286b6cb42a5987b9a203b70c446007ff3473f67192bf461",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"internCode\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"division\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"periodStartDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"periodEndDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"bankName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accountNumber\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"profilePicUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phoneNumber\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"joinDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"attendances\",\"kind\":\"object\",\"type\":\"Attendance\",\"relationName\":\"AttendanceToUser\"},{\"name\":\"helpdeskTickets\",\"kind\":\"object\",\"type\":\"HelpdeskTicket\",\"relationName\":\"HelpdeskTicketToUser\"},{\"name\":\"mentorId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"mentor\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"MentorToInterns\"},{\"name\":\"interns\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"MentorToInterns\"},{\"name\":\"dailyLogs\",\"kind\":\"object\",\"type\":\"DailyLog\",\"relationName\":\"DailyLogToUser\"}],\"dbName\":null},\"Attendance\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"type\",\"kind\":\"enum\",\"type\":\"AttendanceType\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"photoUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"latitude\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"longitude\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"isLate\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AttendanceToUser\"}],\"dbName\":null},\"HelpdeskTicket\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"proofUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"TicketStatus\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"HelpdeskTicketToUser\"}],\"dbName\":null},\"DailyLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"DailyLogToUser\"},{\"name\":\"activity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"LogStatus\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"PredefinedActivity\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"task\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

