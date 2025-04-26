@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest) -> RecommendResponse:
    """Get component recommendations based on user message"""
    try:
        if request.mode == 'quick':
            # Use Claude for quick recommendations
            recommendations = await get_quick_recommendations(request.message)
            return RecommendResponse(recommendations=recommendations)
        else:
            # Use agentic mode for more thorough search
            recommendations, steps = await get_agentic_recommendations(request.message)
            return RecommendResponse(
                recommendations=recommendations,
                search_steps=steps
            )
    except Exception as e:
        return RecommendResponse(
            recommendations=[],
            error=str(e)
        ) 