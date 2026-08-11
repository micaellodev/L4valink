-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "promotion_items" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_items_promotion_id_idx" ON "promotion_items"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_items_menu_item_id_idx" ON "promotion_items"("menu_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_items_promotion_id_menu_item_id_key" ON "promotion_items"("promotion_id", "menu_item_id");

-- AddForeignKey
ALTER TABLE "promotion_items" ADD CONSTRAINT "promotion_items_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_items" ADD CONSTRAINT "promotion_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
