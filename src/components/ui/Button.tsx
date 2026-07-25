import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald text-white hover:bg-emerald-light shadow-lg shadow-emerald/20 hover:shadow-emerald/30 hover:-translate-y-0.5",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5",
  ghost: "text-muted hover:text-white hover:bg-white/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AnchorProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type Props = ButtonProps | AnchorProps;

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return <a href={href} className={classes} {...rest} />;
  }

  return <button type="button" className={classes} {...(props as ButtonProps)} />;
}
