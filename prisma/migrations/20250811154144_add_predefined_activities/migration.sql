-- CreateTable
CREATE TABLE "PredefinedActivity" (
    "id" SERIAL NOT NULL,
    "task" TEXT NOT NULL,

    CONSTRAINT "PredefinedActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PredefinedActivity_task_key" ON "PredefinedActivity"("task");
