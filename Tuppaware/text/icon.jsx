export default function Icon({ children, className = "", style = {}, ...props }) {
  return (
    <i className={className} style={style} {...props}></i>
  );
}