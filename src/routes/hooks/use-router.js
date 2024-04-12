export { useRouter } from 'next/navigation';
// import { useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';

// // ----------------------------------------------------------------------

// function useRouter() {
//     const navigate = useNavigate();

//     const router = useMemo(
//         () => ({
//             back: () => navigate(-1),
//             forward: () => navigate(1),
//             reload: () => window.location.reload(),
//             push: (href, metadata = {}) => navigate(href, { state: { metadata } }),
//             replace: (href) => navigate(href, { replace: true })
//         }),
//         [navigate]
//     );

//     return router;
// }
