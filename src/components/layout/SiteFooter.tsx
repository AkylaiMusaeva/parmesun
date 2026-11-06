import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { mainNav } from "@/config/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-espresso text-cream">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" className="text-3xl" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
            Единая гастрономическая экосистема: кофейня, мастер-классы, события, кейтеринг, обучение и
            партнёрские проекты — с одной программой лояльности.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-5 text-sage">Разделы</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="text-cream/80 hover:text-cream">
                Главная
              </Link>
            </li>
            {mainNav.map((item) => (
              <li key={item.id}>
                <Link to={item.to} className="text-cream/80 hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5 text-sage">О прототипе</p>
          <p className="text-sm leading-relaxed text-cream/70">
            Это демонстрационная версия PARMESUN ONE. Все имена, баллы, визиты и предложения — примеры.
            Заявки из форм направляются в Odoo CRM; демо-баллы и кабинеты пока локальные.
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-editorial flex flex-col justify-between gap-2 py-6 text-xs text-cream/50 sm:flex-row">
          <span>© 2026 PARMESUN</span>
          <span>Прототип v0.1 · демонстрационные данные</span>
        </div>
      </div>
    </footer>
  );
}
