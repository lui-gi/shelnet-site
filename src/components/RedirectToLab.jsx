import { useParams, Navigate } from 'react-router-dom';

// Old /labs/:slug deep links → new nested path, slug preserved.
const RedirectToLab = () => {
  const { slug } = useParams();
  return <Navigate to={`/resources/labs/${slug}`} replace />;
};

export default RedirectToLab;
