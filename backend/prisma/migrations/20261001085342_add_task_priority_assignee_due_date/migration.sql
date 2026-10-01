-- AlterTable
ALTER TABLE `task` ADD COLUMN `assigneeId` INTEGER NULL,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX `Task_assigneeId_idx` ON `task`(`assigneeId`);

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `Task_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
