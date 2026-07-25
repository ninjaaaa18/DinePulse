import Card from "@/components/cards/Card";

type Props = {
  title: string;
  description: string;
  icon: string;
};

export default function SectionPlaceholder({ title, description, icon }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-muted">{description}</p>
      </header>

      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">{icon}</span>
        <p className="mt-4 text-lg font-medium text-white">Coming Soon</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          This section is under development. Check back soon for full functionality.
        </p>
      </Card>
    </div>
  );
}
