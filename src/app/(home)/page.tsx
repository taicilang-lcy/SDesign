import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Generator } from "@/modules/home/ui/components/generator";
import { TemplateGallery } from "@/modules/home/ui/components/template-gallery";
import { PromptDraftProvider } from "@/modules/home/ui/prompt-draft";

const Page = async () => {
  const t = await getTranslations("HomePage");

  return (
    <PromptDraftProvider>
      <div className="flex flex-col max-w-5xl mx-auto w-full">
        <section className="space-y-6 py-[12vh] 2xl:py-40">
          <div className="flex flex-col items-center">
            <Image
              src="/sdesign-s.png"
              alt="SDesign"
              width={56}
              height={56}
              priority
            />
          </div>
          <h1 className="text-2xl md:text-5xl font-bold text-center">
            {t("create")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-center">
            {t("create2")}
          </p>
          <div className="max-w-3xl mx-auto w-full">
            <Generator />
          </div>
        </section>
        <TemplateGallery />
      </div>
    </PromptDraftProvider>
  );
};

export default Page;
