export default function Badge({ text, ...props }) {
  return (
    <span {...props} className="chip">
      {text}
    </span>
  );
}
